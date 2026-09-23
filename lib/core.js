// Pure logic for the Forest Plot Generator: statistics, formatting, validation
// and import parsing. Nothing here touches the DOM or React state, so it can be
// unit tested under Node while the browser loads the same file as a plain script.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ForestPlotCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------- statistics

  const Z_95 = 1.959963985;

  // Upper-tail standard normal probability via Abramowitz & Stegun 7.1.26
  // (|error| < 1.5e-7, far below the precision we display).
  const normalUpperTail = (z) => {
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
      - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 - erf);
  };

  // Fixed-effect inverse-variance meta-analysis, computed on the log scale.
  // Averaging odds ratios - and especially averaging the confidence limits -
  // is not a valid pooled estimate: it discards study precision entirely, so a
  // 20-patient study would carry the same weight as a 10,000-patient one.
  const computePooledEffect = (rows) => {
    const studies = [];
    rows.forEach((d) => {
      const or = Number(d.or);
      const lower = Number(d.lowerCI);
      const upper = Number(d.upperCI);
      // Ratios and their limits must be strictly positive for a log transform.
      if (!(or > 0) || !(lower > 0) || !(upper > 0) || !(upper > lower)) return;
      const se = (Math.log(upper) - Math.log(lower)) / (2 * Z_95);
      if (!Number.isFinite(se) || se <= 0) return;
      studies.push({ logOR: Math.log(or), weight: 1 / (se * se) });
    });

    if (studies.length === 0) return null;
    const totalWeight = studies.reduce((sum, st) => sum + st.weight, 0);
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) return null;

    const pooledLogOR = studies.reduce((sum, st) => sum + st.weight * st.logOR, 0) / totalWeight;
    const pooledSE = Math.sqrt(1 / totalWeight);
    if (!Number.isFinite(pooledLogOR) || !Number.isFinite(pooledSE)) return null;

    return {
      or: Math.exp(pooledLogOR),
      lowerCI: Math.exp(pooledLogOR - Z_95 * pooledSE),
      upperCI: Math.exp(pooledLogOR + Z_95 * pooledSE),
      pValue: 2 * normalUpperTail(pooledLogOR / pooledSE),
      studyCount: studies.length,
      excludedCount: rows.length - studies.length
    };
  };

  const isSignificant = (lowerCI, upperCI) => !(lowerCI <= 1.0 && upperCI >= 1.0);

  const isValidData = (row) => {
    const { or, lowerCI, upperCI } = row;
    if (or === null || lowerCI === null || upperCI === null) return false;
    if (or === undefined || lowerCI === undefined || upperCI === undefined) return false;
    if (or === '' || lowerCI === '' || upperCI === '') return false;
    if (isNaN(or) || isNaN(lowerCI) || isNaN(upperCI)) return false;
    if (or <= 0 || lowerCI <= 0 || upperCI <= 0) return false;
    if (lowerCI >= upperCI) return false;
    return true;
  };

  const scaleValue = (value, scaleType) => (scaleType === 'log' ? Math.log(value) : value);

  // ---------------------------------------------------------------------- axis

  // Strips binary floating-point noise: 0.9 + 0.05 is 0.9500000000000001, and
  // that drift used to make `ticks.includes(1)` miss and draw 1 twice.
  const cleanFloat = (x) => Number(x.toPrecision(12));

  // Picks the axis range when the user has not set one. The line of no effect
  // (1) is always inside it, and nothing in the data is ever cut off: this used
  // to floor the minimum at 0.01, which clipped rare-event ratios on a log axis
  // and, when every value was below 0.01, produced an inverted axis.
  const computeAutoAxis = (values, scale) => {
    const finite = values.map(Number).filter((v) => Number.isFinite(v) && v > 0);
    if (finite.length === 0) return { min: 0.1, max: 10 };

    const dataMin = Math.min(...finite, 1);
    const dataMax = Math.max(...finite, 1);

    if (scale === 'log') {
      const min = cleanFloat(Math.pow(10, Math.floor(Math.log10(dataMin))));
      let max = cleanFloat(Math.pow(10, Math.ceil(Math.log10(dataMax))));
      if (!(max > min)) max = cleanFloat(min * 10);
      return { min, max };
    }

    const range = dataMax - dataMin > 0 ? dataMax - dataMin : 1;
    const padding = range * 0.15;
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
    // Ratios are positive, so a linear axis never needs to go below 0.
    const min = cleanFloat(Math.floor(Math.max(0, dataMin - padding) / magnitude) * magnitude);
    let max = cleanFloat(Math.ceil((dataMax + padding) / magnitude) * magnitude);
    if (!(max > min)) max = cleanFloat(min + magnitude);
    return { min, max };
  };

  // Tick positions for an axis. Every loop is bounded: a non-finite bound used
  // to spin forever (Math.pow saturates at Infinity and Infinity <= Infinity).
  const generateSmartTicks = (minVal, maxVal, scale) => {
    if (!Number.isFinite(minVal) || !Number.isFinite(maxVal) || !(maxVal > minVal)) return [];
    const MAX_TICKS = 1000;

    if (scale === 'log') {
      if (!(minVal > 0)) return [];
      const inRange = (v) => v >= minVal * 0.9 && v <= maxVal * 1.1;

      // Powers of ten, then 2x and 5x in between.
      const majors = [];
      for (let power = Math.floor(Math.log10(minVal));
        Math.pow(10, power) <= maxVal * 1.1 && majors.length < MAX_TICKS; power++) {
        const val = cleanFloat(Math.pow(10, power));
        if (val >= minVal * 0.9) majors.push(val);
      }

      const intermediate = [];
      for (let i = 0; i < majors.length - 1; i++) {
        [2, 5].forEach((factor) => {
          const val = cleanFloat(majors[i] * factor);
          if (val < majors[i + 1] && inRange(val)) intermediate.push(val);
        });
      }

      return [...majors, ...intermediate].filter(inRange).sort((a, b) => a - b);
    }

    const range = maxVal - minVal;
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
    const normalized = range / magnitude;
    let step;
    if (normalized < 1.5) step = 0.2 * magnitude;
    else if (normalized < 3) step = 0.5 * magnitude;
    else if (normalized < 7) step = 1 * magnitude;
    else step = 2 * magnitude;
    if (!Number.isFinite(step) || step <= 0) return [minVal, maxVal];

    // Ticks are k * step for whole k, not a running sum, so error cannot build
    // up; the epsilon keeps 0.9 / 0.05 = 18.000000000000004 from skipping 0.9.
    const first = Math.ceil(minVal / step - 1e-9);
    const last = Math.floor(maxVal / step + 1e-9);
    const ticks = [];
    for (let k = first; k <= last && ticks.length < MAX_TICKS; k++) {
      ticks.push(cleanFloat(k * step));
    }

    if (minVal < 1 && maxVal > 1 && !ticks.includes(1)) {
      ticks.push(1);
      ticks.sort((a, b) => a - b);
    }
    return ticks;
  };

  // A tick label shows the tick's own value. The old fixed-decimals labels
  // printed 0.95 as "1.0" next to the real 1.0, and 0.001 as "0.00".
  const formatTickLabel = (value) => formatNumber(Number(Number(value).toPrecision(10)));

  // ---------------------------------------------------------------- formatting

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    const str = num.toString();
    if (!str.includes('.')) return str;
    // Remove trailing zeros
    return str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  // Computed estimates (unlike user-typed values) carry full float precision,
  // so round them for display: 1.100649884255825 -> 1.1.
  const formatEstimate = (num) => {
    if (!Number.isFinite(num)) return String(num);
    return formatNumber(Number(num.toPrecision(3)));
  };

  const formatPValue = (pValue) => {
    // A missing p-value is left blank rather than printed as NaN.
    if (pValue === null || pValue === undefined || pValue === '') return '';
    const num = Number(pValue);
    if (!Number.isFinite(num)) return '';
    if (num < 0.001) return '<0.001';
    return formatNumber(Number(num.toPrecision(3)));
  };

  // ------------------------------------------------------------ number parsing

  // Parses a spreadsheet or CSV cell. Returns null for anything it cannot read,
  // so callers can leave the field empty instead of inventing a value.
  const parseNumericCell = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    let str = String(value).trim();
    if (str === '') return null;
    str = str.replace(/\s/g, '');

    // Accept a comma decimal separator when it is unambiguous: exactly one
    // comma, no dot, and not a thousands group like "1,520". A whole part of
    // 0 (or none) can never be a thousands group, so "0,025" is 0.025 -- the
    // usual way a European file writes a p-value.
    if (!str.includes('.') && (str.match(/,/g) || []).length === 1) {
      const [whole, decimals] = str.split(',');
      if (decimals.length !== 3 || /^[+-]?0?$/.test(whole)) str = str.replace(',', '.');
    }

    // Reject anything that is not a plain number: "N/A", "1.5 (0.8-2.1)", "<0.001".
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(str)) return null;
    const num = Number(str);
    return Number.isFinite(num) ? num : null;
  };

  // Keeps '' while a field is being cleared so state never holds NaN.
  const parseNumericInput = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return '';
    const num = Number(raw);
    return Number.isFinite(num) ? num : '';
  };

  // Coerces a possibly-empty setting at the point of use. `min` guards the
  // dimensions and font sizes: a negative width is as destructive to the SVG
  // geometry as an empty one, and used to blank the whole preview.
  const toNumber = (value, fallback, min) => {
    if (value === '' || value === null || value === undefined) return fallback;
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (min !== undefined && num < min) return fallback;
    return num;
  };

  // ------------------------------------------------------- import column names

  const COLUMN_ALIASES = {
    variable: ['variable', 'study', 'studyname', 'name', 'label', 'outcome', 'subgroup', 'trial'],
    or: ['or', 'oddsratio', 'rr', 'riskratio', 'hr', 'hazardratio', 'estimate', 'effect', 'effectsize', 'point', 'pointestimate'],
    lowerCI: ['lower', 'lowerci', 'cilower', 'lcl', 'lci', 'lower95', 'l95', 'ci95lower', 'lowerlimit', 'lowerbound'],
    upperCI: ['upper', 'upperci', 'ciupper', 'ucl', 'uci', 'upper95', 'u95', 'ci95upper', 'upperlimit', 'upperbound'],
    pValue: ['p', 'pvalue', 'pval', 'sig', 'significance'],
    sampleSize: ['n', 'samplesize', 'sample', 'size', 'participants', 'patients'],
    group: ['group', 'section', 'category', 'class', 'heading']
  };

  // Field order used when a header cannot be matched by name. This is the layout
  // the importer assumed unconditionally before column names were considered.
  const POSITIONAL_FIELDS = ['variable', 'or', 'lowerCI', 'upperCI', 'pValue', 'sampleSize', 'group'];

  // Without these four there is no forest plot, so they fall back to their
  // conventional slot even in a file whose headers mean nothing to us.
  const REQUIRED_FIELDS = ['variable', 'or', 'lowerCI', 'upperCI'];

  const CI_HEADER_MATCHERS = {
    lowerCI: (h) => h.includes('lower') || ['ll', 'lb', 'low', 'cilow', 'lowci'].includes(h),
    upperCI: (h) => h.includes('upper') || ['ul', 'ub', 'high', 'up', 'cihigh', 'highci', 'cihi'].includes(h)
  };

  const normalizeHeader = (header) => String(header === null || header === undefined ? '' : header)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // Maps each field to the header that holds it, by name where possible and by
  // position otherwise. Returns { mapping, matchedByName } so callers can tell
  // the user which columns were used.
  const resolveColumns = (headers) => {
    const mapping = {};
    const matchedByName = {};
    const taken = new Set();

    POSITIONAL_FIELDS.forEach((field) => {
      const aliases = COLUMN_ALIASES[field];
      const index = headers.findIndex((h, i) => !taken.has(i) && aliases.includes(normalizeHeader(h)));
      if (index !== -1) {
        mapping[field] = headers[index];
        matchedByName[field] = true;
        taken.add(index);
      }
    });

    // Confidence limits are written many ways ("Lower 95% CI", "95% CI lower",
    // "LL"), too many to list exactly, so any still-unclaimed header that says
    // lower or upper is taken for them before falling back to position.
    Object.entries(CI_HEADER_MATCHERS).forEach(([field, matches]) => {
      if (mapping[field] !== undefined) return;
      const index = headers.findIndex((h, i) => !taken.has(i) && matches(normalizeHeader(h)));
      if (index !== -1) {
        mapping[field] = headers[index];
        matchedByName[field] = true;
        taken.add(index);
      }
    });

    // If nothing matched by name, the headers mean nothing to us and the file is
    // treated as positional throughout -- the behaviour before names were read.
    // But once something HAS matched, the headers are meaningful, so a column we
    // could not name is a column that holds something else: binding it to an
    // optional field is how "Study,OR,Lower,Upper,Events,Total" ended up
    // printing p=12. Optional fields are then left unmapped instead.
    const anyNamedMatch = Object.keys(matchedByName).length > 0;

    POSITIONAL_FIELDS.forEach((field, slot) => {
      if (mapping[field] !== undefined) return;

      const mayFallBack = !anyNamedMatch || REQUIRED_FIELDS.includes(field);
      if (mayFallBack && slot < headers.length && !taken.has(slot)) {
        mapping[field] = headers[slot];
        matchedByName[field] = false;
        taken.add(slot);
      } else {
        mapping[field] = null;
        matchedByName[field] = false;
      }
    });

    return { mapping, matchedByName };
  };

  // Builds a plot row from a source record. Unreadable numbers become null and
  // are counted, never replaced with a plausible default.
  const buildRow = (record, mapping, index) => {
    const cell = (field) => (mapping[field] === null || mapping[field] === undefined
      ? undefined
      : record[mapping[field]]);

    const or = parseNumericCell(cell('or'));
    const lowerCI = parseNumericCell(cell('lowerCI'));
    const upperCI = parseNumericCell(cell('upperCI'));
    const rawPValue = cell('pValue');
    const pValue = parseNumericCell(rawPValue);

    const rawVariable = cell('variable');
    const variable = rawVariable === undefined || rawVariable === null || String(rawVariable).trim() === ''
      ? `Variable ${index + 1}`
      : String(rawVariable);

    const sampleSize = cell('sampleSize');
    const group = cell('group');

    return {
      row: {
        id: index + 1,
        variable,
        or,
        lowerCI,
        upperCI,
        pValue,
        sampleSize: sampleSize === undefined || sampleSize === null ? '' : sampleSize,
        group: group === undefined || group === null ? '' : String(group),
        color: 'auto',
        position: index + 1
      },
      unreadable: [or, lowerCI, upperCI].some((v) => v === null),
      // A p-value is optional, so a blank one is fine; one that was written
      // but cannot be read ("ns", "<0.05") is reported rather than dropped.
      pValueUnreadable: pValue === null && rawPValue !== undefined && rawPValue !== null &&
        String(rawPValue).trim() !== ''
    };
  };

  // Turns parsed records into plot rows plus a summary for the user.
  const buildRowsFromRecords = (records, headers) => {
    const { mapping, matchedByName } = resolveColumns(headers);
    return { ...buildRowsWithMapping(records, mapping), mapping, matchedByName };
  };

  // Builds rows with a mapping chosen elsewhere (the Excel wizard's dropdowns)
  // and counts what could not be read.
  const buildRowsWithMapping = (records, mapping) => {
    const rows = [];
    let unreadableCount = 0;
    let pValueUnreadableCount = 0;

    records.forEach((record, index) => {
      const built = buildRow(record, mapping, index);
      if (built.unreadable) unreadableCount += 1;
      if (built.pValueUnreadable) pValueUnreadableCount += 1;
      rows.push(built.row);
    });

    return { rows, unreadableCount, pValueUnreadableCount };
  };

  // The part of an import summary that tells the user what went wrong.
  const describeImportProblems = ({ unreadableCount = 0, pValueUnreadableCount = 0, malformedLineCount = 0 }) => {
    const notes = [];
    if (unreadableCount > 0) {
      notes.push(`${unreadableCount} row(s) had an estimate or CI that could not be read; ` +
        'those fields were left empty and will not be plotted.');
    }
    if (pValueUnreadableCount > 0) {
      notes.push(`${pValueUnreadableCount} p-value(s) could not be read (for example "ns" or "<0.05") ` +
        'and were left empty.');
    }
    if (malformedLineCount > 0) {
      notes.push(`${malformedLineCount} line(s) of the file were malformed; check those rows.`);
    }
    return notes.join('\n\n');
  };

  const describeMapping = (mapping, matchedByName) => POSITIONAL_FIELDS
    .filter((field) => mapping[field] !== null && mapping[field] !== undefined)
    .map((field) => `${field}: "${mapping[field]}"${matchedByName[field] ? '' : ' (by position)'}`)
    .join('\n');

  // -------------------------------------------------------- project validation

  const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

  // A project file is hand-editable and written by older versions, so every
  // value in it is untrusted. Anything React would render as text must be a
  // string or number: an object there throws inside React itself, past every
  // try/catch, and used to land on the crash screen.
  const toText = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return '';
  };

  const normalizeNumericField = (value) => {
    if (value === null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : '';
    if (typeof value === 'string') {
      const num = parseNumericCell(value);
      return num === null ? '' : num;
    }
    return '';
  };

  const normalizeRow = (row, index) => {
    const variable = typeof row.variable === 'string' || typeof row.variable === 'number'
      ? toText(row.variable)
      : `Variable ${index + 1}`;
    const position = toNumber(row.position, NaN);
    const color = typeof row.color === 'string' && (row.color === 'auto' || /^#[0-9a-f]{3,8}$/i.test(row.color))
      ? row.color
      : 'auto';
    return {
      ...row,
      variable,
      or: normalizeNumericField(row.or),
      lowerCI: normalizeNumericField(row.lowerCI),
      upperCI: normalizeNumericField(row.upperCI),
      pValue: normalizeNumericField(row.pValue),
      sampleSize: toText(row.sampleSize),
      group: toText(row.group),
      color,
      position: Number.isFinite(position) ? position : index + 1
    };
  };

  // Gives every item a unique numeric id, keeping the ids that are already
  // usable. Rows and plots are edited and deleted by id, so two sharing one
  // used to make editing either change both.
  const assignUniqueIds = (items) => {
    const used = new Set();
    const usable = (id) => typeof id === 'number' && Number.isFinite(id) && !used.has(id);
    const kept = items.map((item) => {
      if (usable(item.id)) { used.add(item.id); return true; }
      return false;
    });
    let next = Math.max(0, ...used) + 1;
    return items.map((item, i) => (kept[i] ? item : { ...item, id: next++ }));
  };

  const normalizeRows = (rows, plotLabel) => assignUniqueIds(rows.map((row, r) => {
    if (!isPlainObject(row)) {
      throw new Error(`${plotLabel}, row ${r + 1} is not a valid data row.`);
    }
    return normalizeRow(row, r);
  }));

  // Settings are merged over their defaults, and a value of the wrong kind
  // (an object for a title, a string for a checkbox) falls back to the default.
  const normalizeSettings = (settings, defaults) => {
    const out = { ...defaults, ...(isPlainObject(settings) ? settings : {}) };
    Object.keys(defaults).forEach((key) => {
      const fallback = defaults[key];
      const value = out[key];
      let ok;
      if (typeof fallback === 'boolean') {
        ok = typeof value === 'boolean';
      } else if (typeof fallback === 'number') {
        ok = value === '' || Number.isFinite(toNumber(value, NaN));
      } else {
        ok = typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
      }
      if (!ok) out[key] = fallback;
    });
    return out;
  };

  // Checks a loaded project before any state is written, so a malformed file
  // cannot leave the app rendering against a half-applied project.
  const validateProject = (project) => {
    if (!isPlainObject(project)) {
      throw new Error('This file does not contain a project.');
    }

    const validatePlot = (plot, index) => {
      const label = `Plot ${index + 1}`;
      if (!isPlainObject(plot)) {
        throw new Error(`${label} is not valid.`);
      }
      if (plot.id === undefined || plot.id === null) {
        throw new Error(`${label} is missing its id.`);
      }
      if (!Array.isArray(plot.data)) {
        throw new Error(`${label} is missing its data rows.`);
      }
      if (!isPlainObject(plot.settings)) {
        throw new Error(`${label} is missing its settings.`);
      }
      return {
        ...plot,
        title: typeof plot.title === 'string' || typeof plot.title === 'number'
          ? toText(plot.title)
          : label,
        data: normalizeRows(plot.data, label)
      };
    };

    if (Array.isArray(project.plots)) {
      if (project.plots.length === 0) {
        throw new Error('This project contains no plots.');
      }
      return {
        kind: 'current',
        plots: assignUniqueIds(project.plots.map(validatePlot)),
        globalSettings: isPlainObject(project.globalSettings) ? project.globalSettings : null
      };
    }

    if (Array.isArray(project.data)) {
      return {
        kind: 'legacy',
        data: normalizeRows(project.data, 'The project'),
        settings: isPlainObject(project.settings) ? project.settings : {}
      };
    }

    throw new Error('This file does not look like a Forest Plot project.');
  };

  // ------------------------------------------------------------------ ordering

  const rowPosition = (row) => {
    const pos = toNumber(row.position, NaN);
    return Number.isFinite(pos) ? pos : toNumber(row.id, 0);
  };

  const compareRows = (a, b) => {
    const diff = rowPosition(a) - rowPosition(b);
    if (diff !== 0) return diff;
    return toNumber(a.id, 0) - toNumber(b.id, 0);
  };

  const sortRowsByPosition = (rows) => [...rows].sort(compareRows);

  // Groups rows into sections and orders both the sections and their rows by
  // position, so the Position column controls the whole layout rather than only
  // the order inside a section.
  const groupRowsIntoSections = (rows) => {
    const sections = new Map();

    rows.forEach((row) => {
      const name = row.group || 'Ungrouped';
      if (!sections.has(name)) sections.set(name, []);
      sections.get(name).push(row);
    });

    return [...sections.entries()]
      .map(([name, sectionRows]) => ({
        name,
        rows: sortRowsByPosition(sectionRows),
        order: Math.min(...sectionRows.map(rowPosition))
      }))
      .sort((a, b) => a.order - b.order);
  };

  return {
    Z_95,
    normalUpperTail,
    computePooledEffect,
    isSignificant,
    isValidData,
    scaleValue,
    computeAutoAxis,
    generateSmartTicks,
    formatTickLabel,
    formatNumber,
    formatEstimate,
    formatPValue,
    parseNumericCell,
    parseNumericInput,
    toNumber,
    COLUMN_ALIASES,
    POSITIONAL_FIELDS,
    normalizeHeader,
    resolveColumns,
    buildRow,
    buildRowsFromRecords,
    buildRowsWithMapping,
    describeImportProblems,
    describeMapping,
    normalizeSettings,
    validateProject,
    rowPosition,
    compareRows,
    sortRowsByPosition,
    groupRowsIntoSections
  };
});
