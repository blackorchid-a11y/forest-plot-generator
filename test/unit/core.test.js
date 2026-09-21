const test = require('node:test');
const assert = require('node:assert');
const core = require('../../lib/core.js');

const {
  normalUpperTail, computePooledEffect, isValidData,
  formatNumber, formatEstimate, formatPValue,
  parseNumericCell, parseNumericInput, toNumber,
  resolveColumns, buildRowsFromRecords,
  validateProject, groupRowsIntoSections, sortRowsByPosition
} = core;

test('normal upper tail matches standard table values', () => {
  const twoSided = (z) => 2 * normalUpperTail(z);
  assert.ok(Math.abs(twoSided(1.959963985) - 0.05) < 1e-6);
  assert.ok(Math.abs(twoSided(1) - 0.3173105) < 1e-6);
  assert.ok(Math.abs(twoSided(2.5758293) - 0.01) < 1e-6);
  assert.ok(Math.abs(twoSided(3) - 0.0026998) < 1e-6);
  assert.ok(Math.abs(twoSided(0) - 1) < 1e-9);
});

test('a single study reproduces its own estimate and interval', () => {
  const pooled = computePooledEffect([{ or: 2.0, lowerCI: 1.0, upperCI: 4.0 }]);
  assert.ok(Math.abs(pooled.or - 2.0) < 1e-9);
  assert.ok(Math.abs(pooled.lowerCI - 1.0) < 1e-9);
  assert.ok(Math.abs(pooled.upperCI - 4.0) < 1e-9);
  assert.strictEqual(pooled.studyCount, 1);
});

test('two identical studies keep the estimate and narrow the log-CI by sqrt(2)', () => {
  const study = { or: 2.0, lowerCI: 1.0, upperCI: 4.0 };
  const one = computePooledEffect([study]);
  const two = computePooledEffect([study, study]);
  assert.ok(Math.abs(two.or - 2.0) < 1e-9);
  const widthOne = Math.log(one.upperCI) - Math.log(one.lowerCI);
  const widthTwo = Math.log(two.upperCI) - Math.log(two.lowerCI);
  assert.ok(Math.abs(widthOne / widthTwo - Math.SQRT2) < 1e-9);
});

test('pooling is weighted by precision, not by study count', () => {
  const precise = { or: 1.10, lowerCI: 1.05, upperCI: 1.15 };
  const imprecise = { or: 5.00, lowerCI: 0.50, upperCI: 50.0 };
  const pooled = computePooledEffect([precise, imprecise]);
  // The old unweighted mean would have produced 3.05 here.
  assert.ok(Math.abs(pooled.or - 1.1) < 0.06, `pooled OR was ${pooled.or}`);
  assert.ok(pooled.pValue < 0.001);
});

test('rows that cannot be log-transformed are excluded, not turned into NaN', () => {
  const pooled = computePooledEffect([
    { or: 2.0, lowerCI: 1.0, upperCI: 4.0 },
    { or: 0, lowerCI: 0.5, upperCI: 2 },
    { or: 1.5, lowerCI: 0, upperCI: 3 },
    { or: 1.5, lowerCI: 2, upperCI: 1 },
    { or: 1.5, lowerCI: 1.5, upperCI: 1.5 },
    { or: NaN, lowerCI: 1, upperCI: 2 },
    { or: null, lowerCI: null, upperCI: null }
  ]);
  assert.strictEqual(pooled.studyCount, 1);
  assert.strictEqual(pooled.excludedCount, 6);
  assert.ok(Number.isFinite(pooled.or));
});

test('pooling returns null when nothing is usable', () => {
  assert.strictEqual(computePooledEffect([]), null);
  assert.strictEqual(computePooledEffect([{ or: 0, lowerCI: 0, upperCI: 0 }]), null);
});

test('a null effect gives p = 1', () => {
  const pooled = computePooledEffect([{ or: 1.0, lowerCI: 0.5, upperCI: 2.0 }]);
  assert.ok(Math.abs(pooled.pValue - 1) < 1e-9);
});

test('isValidData rejects nulls, blanks and impossible intervals', () => {
  assert.ok(isValidData({ or: 1.5, lowerCI: 1.2, upperCI: 1.9 }));
  assert.ok(!isValidData({ or: null, lowerCI: 1.2, upperCI: 1.9 }));
  assert.ok(!isValidData({ or: '', lowerCI: 1.2, upperCI: 1.9 }));
  assert.ok(!isValidData({ or: 1.5, lowerCI: 1.9, upperCI: 1.2 }));
  assert.ok(!isValidData({ or: -1, lowerCI: 1.2, upperCI: 1.9 }));
  assert.ok(!isValidData({ or: NaN, lowerCI: 1.2, upperCI: 1.9 }));
});

test('parseNumericCell never invents a value', () => {
  assert.strictEqual(parseNumericCell('1.52'), 1.52);
  assert.strictEqual(parseNumericCell(1.52), 1.52);
  assert.strictEqual(parseNumericCell('  2 '), 2);
  assert.strictEqual(parseNumericCell(0), 0);
  assert.strictEqual(parseNumericCell('0'), 0);
  // These all used to become 1.0 / 0.8 / 1.2 / 0.05.
  assert.strictEqual(parseNumericCell(''), null);
  assert.strictEqual(parseNumericCell('   '), null);
  assert.strictEqual(parseNumericCell('N/A'), null);
  assert.strictEqual(parseNumericCell('-'), null);
  assert.strictEqual(parseNumericCell(null), null);
  assert.strictEqual(parseNumericCell(undefined), null);
  assert.strictEqual(parseNumericCell('1.5 (0.8-2.1)'), null);
  assert.strictEqual(parseNumericCell('<0.001'), null);
  assert.strictEqual(parseNumericCell(NaN), null);
});

test('parseNumericCell accepts an unambiguous comma decimal', () => {
  assert.strictEqual(parseNumericCell('1,52'), 1.52);
  assert.strictEqual(parseNumericCell('0,05'), 0.05);
  // A thousands group must not silently become a fraction.
  assert.strictEqual(parseNumericCell('1,520'), null);
  assert.strictEqual(parseNumericCell('1,2,3'), null);
});

test('parseNumericInput keeps empty fields empty instead of NaN', () => {
  assert.strictEqual(parseNumericInput(''), '');
  assert.strictEqual(parseNumericInput('abc'), '');
  assert.strictEqual(parseNumericInput('12'), 12);
  assert.strictEqual(parseNumericInput('1.5'), 1.5);
});

test('toNumber falls back rather than propagating NaN', () => {
  assert.strictEqual(toNumber('', 800), 800);
  assert.strictEqual(toNumber('abc', 800), 800);
  assert.strictEqual(toNumber(null, 800), 800);
  assert.strictEqual(toNumber('640', 800), 640);
  assert.strictEqual(toNumber(0, 800), 0);
  assert.strictEqual(toNumber(Infinity, 800), 800);
});

test('toNumber rejects values below the given minimum', () => {
  // A negative width destroys the SVG geometry exactly like an empty one does.
  assert.strictEqual(toNumber(-100, 800, 1), 800);
  assert.strictEqual(toNumber(0, 800, 1), 800);
  assert.strictEqual(toNumber('-5', 14, 1), 14);
  assert.strictEqual(toNumber(640, 800, 1), 640);
  // Zero stays legal where zero is meaningful, such as spacing.
  assert.strictEqual(toNumber(0, 30, 0), 0);
});

test('formatters round computed values and blank missing p-values', () => {
  assert.strictEqual(formatNumber(1.5), '1.5');
  assert.strictEqual(formatNumber(2), '2');
  assert.strictEqual(formatEstimate(1.100649884255825), '1.1');
  assert.strictEqual(formatEstimate(1.051716711625535), '1.05');
  assert.strictEqual(formatPValue(0.0004), '<0.001');
  assert.strictEqual(formatPValue(0.5), '0.5');
  assert.strictEqual(formatPValue(null), '');
  assert.strictEqual(formatPValue(''), '');
  assert.strictEqual(formatPValue(NaN), '');
});

test('columns resolve by name even when the file is reordered', () => {
  const headers = ['Study', 'Lower CI', 'Upper CI', 'Odds Ratio', 'P-value', 'N', 'Group'];
  const { mapping, matchedByName } = resolveColumns(headers);
  assert.strictEqual(mapping.variable, 'Study');
  assert.strictEqual(mapping.or, 'Odds Ratio');
  assert.strictEqual(mapping.lowerCI, 'Lower CI');
  assert.strictEqual(mapping.upperCI, 'Upper CI');
  assert.strictEqual(mapping.pValue, 'P-value');
  assert.ok(matchedByName.or);
});

test('meaningful headers never bind an unrelated column to an optional field', () => {
  // Study/OR/Lower/Upper match by name; Events and Total do not. Falling back
  // positionally here bound Events to pValue and printed "p=12".
  const headers = ['Study', 'OR', 'Lower', 'Upper', 'Events', 'Total'];
  const { mapping } = resolveColumns(headers);
  assert.strictEqual(mapping.or, 'OR');
  assert.strictEqual(mapping.lowerCI, 'Lower');
  assert.strictEqual(mapping.pValue, null);
  assert.strictEqual(mapping.sampleSize, null);
  assert.strictEqual(mapping.group, null);

  const { rows } = buildRowsFromRecords(
    [{ Study: 'A', OR: 1.5, Lower: 1.2, Upper: 1.9, Events: 12, Total: 40 }], headers);
  assert.strictEqual(rows[0].pValue, null, 'Events leaked into the p-value');
  assert.strictEqual(rows[0].or, 1.5);
});

test('unrecognisable headers still map positionally', () => {
  const headers = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const { mapping, matchedByName } = resolveColumns(headers);
  assert.strictEqual(mapping.variable, 'a');
  assert.strictEqual(mapping.or, 'b');
  assert.strictEqual(mapping.lowerCI, 'c');
  assert.strictEqual(mapping.upperCI, 'd');
  assert.strictEqual(matchedByName.or, false);
});

test('a swapped OR / lower-CI file imports correctly by name', () => {
  const headers = ['Study', 'Lower CI', 'OR', 'Upper CI'];
  const records = [{ Study: 'Trial A', 'Lower CI': 1.2, OR: 1.5, 'Upper CI': 1.9 }];
  const { rows } = buildRowsFromRecords(records, headers);
  assert.strictEqual(rows[0].or, 1.5);
  assert.strictEqual(rows[0].lowerCI, 1.2);
  assert.strictEqual(rows[0].upperCI, 1.9);
});

test('unreadable cells are counted and left null', () => {
  const headers = ['Study', 'OR', 'Lower CI', 'Upper CI', 'P'];
  const records = [
    { Study: 'Good', OR: '1.5', 'Lower CI': '1.2', 'Upper CI': '1.9', P: '0.01' },
    { Study: 'Bad', OR: 'N/A', 'Lower CI': '', 'Upper CI': '1.9', P: 'ns' }
  ];
  const { rows, unreadableCount } = buildRowsFromRecords(records, headers);
  assert.strictEqual(unreadableCount, 1);
  assert.strictEqual(rows[1].or, null);
  assert.strictEqual(rows[1].lowerCI, null);
  assert.strictEqual(rows[1].pValue, null);
  assert.ok(!isValidData(rows[1]));
  assert.ok(isValidData(rows[0]));
});

test('rows without a name get a generated one', () => {
  const { rows } = buildRowsFromRecords([{ Study: '', OR: 1 }], ['Study', 'OR']);
  assert.strictEqual(rows[0].variable, 'Variable 1');
});

test('validateProject rejects files that would white-screen the app', () => {
  assert.throws(() => validateProject({ version: '2.0', plots: [] }), /no plots/i);
  assert.throws(() => validateProject({ plots: [{ data: [], settings: {} }] }), /id/i);
  assert.throws(() => validateProject({ plots: [{ id: 1, settings: {} }] }), /data/i);
  assert.throws(() => validateProject({ plots: [{ id: 1, data: [] }] }), /settings/i);
  assert.throws(() => validateProject({}), /Forest Plot project/i);
  assert.throws(() => validateProject(null), /project/i);
});

test('validateProject accepts current and legacy files', () => {
  const current = validateProject({ plots: [{ id: 1, data: [], settings: {} }] });
  assert.strictEqual(current.kind, 'current');
  const legacy = validateProject({ data: [{ id: 1 }], settings: { title: 'x' } });
  assert.strictEqual(legacy.kind, 'legacy');
});

test('position orders rows within a section', () => {
  const rows = [
    { id: 1, position: 3, group: 'A' },
    { id: 2, position: 1, group: 'A' },
    { id: 3, position: 2, group: 'A' }
  ];
  assert.deepStrictEqual(sortRowsByPosition(rows).map((r) => r.id), [2, 3, 1]);
});

test('position orders sections too, not just rows inside them', () => {
  // "Second" appears first in the data array but holds the higher positions.
  const rows = [
    { id: 1, position: 10, group: 'Second' },
    { id: 2, position: 11, group: 'Second' },
    { id: 3, position: 1, group: 'First' },
    { id: 4, position: 2, group: 'First' }
  ];
  const sections = groupRowsIntoSections(rows);
  assert.deepStrictEqual(sections.map((s) => s.name), ['First', 'Second']);
  assert.deepStrictEqual(sections[0].rows.map((r) => r.id), [3, 4]);
});

test('rows without a position fall back to id order', () => {
  const rows = [{ id: 3, group: '' }, { id: 1, group: '' }, { id: 2, group: '' }];
  assert.deepStrictEqual(sortRowsByPosition(rows).map((r) => r.id), [1, 2, 3]);
});
