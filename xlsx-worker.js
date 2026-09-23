// Spreadsheet parsing, run by main.js in its own Electron utility process: one
// process per open workbook. A spreadsheet is untrusted input, and a parser bug
// triggered by a crafted file (SheetJS has had both prototype-pollution and
// runaway-regex CVEs) then stays confined to a process that holds nothing but
// that file. It cannot reach the main process, and if parsing hangs, main.js
// kills this process on a timeout instead of the whole app freezing.
//
// Protocol: main.js posts { id, type, payload }; we answer
// { id, ok: true, result } or { id, ok: false, error }.
const XLSX = require('xlsx');

// A sheet can declare any '!ref' it likes and the range fields are
// user-editable, so both are treated as untrusted and capped.
const MAX_ROWS = 50000;
const MAX_COLS = 256;

// Shown when a sheet declares no range at all; the user can edit it.
const DEFAULT_RANGE = { start: 'A1', end: 'E10' };

// Intersects the requested range with the sheet's real extent, then caps it.
const clampRange = (worksheet, start, end) => {
  let requested;
  try {
    requested = XLSX.utils.decode_range(String(start) + ':' + String(end));
  } catch {
    throw new Error('That cell range is not valid.');
  }

  const ref = worksheet['!ref'];
  const extent = ref ? XLSX.utils.decode_range(ref) : requested;

  const range = {
    s: {
      r: Math.max(requested.s.r, extent.s.r, 0),
      c: Math.max(requested.s.c, extent.s.c, 0)
    },
    e: {
      r: Math.min(requested.e.r, extent.e.r),
      c: Math.min(requested.e.c, extent.e.c)
    }
  };

  let truncated = range.e.r < requested.e.r || range.e.c < requested.e.c;

  if (range.e.r - range.s.r + 1 > MAX_ROWS) {
    range.e.r = range.s.r + MAX_ROWS - 1;
    truncated = true;
  }
  if (range.e.c - range.s.c + 1 > MAX_COLS) {
    range.e.c = range.s.c + MAX_COLS - 1;
    truncated = true;
  }

  const empty = range.e.r < range.s.r || range.e.c < range.s.c;
  return { range, truncated, empty };
};

// The range a sheet declares it uses. A one-cell sheet declares a bare "B2"
// with no colon; that is a range of one cell, not a reason to guess A1:E10.
const usedRange = (worksheet) => {
  const ref = worksheet['!ref'];
  if (!ref) return { ...DEFAULT_RANGE };
  const [start, end = start] = ref.split(':');
  const { range } = clampRange(worksheet, start, end);
  return {
    start: XLSX.utils.encode_cell(range.s),
    end: XLSX.utils.encode_cell(range.e)
  };
};

// SheetJS's `header: 1` means "give me arrays of arrays", NOT "row 1 is the
// header". Omitting the option is what makes it key each row by header text.
const readRows = (worksheet, start, end, hasHeaders) => {
  const { range, truncated, empty } = clampRange(worksheet, start, end);
  if (empty) return { rows: [], truncated: false };

  const options = { range, defval: '' };
  if (!hasHeaders) options.header = 1;
  return { rows: XLSX.utils.sheet_to_json(worksheet, options), truncated };
};

let workbook = null;

const getSheet = (sheetName) => {
  if (!workbook) throw new Error('No spreadsheet is open.');
  // Own properties only: a sheet name like "__proto__" must not resolve to
  // Object.prototype.
  if (!Object.prototype.hasOwnProperty.call(workbook.Sheets, sheetName)) {
    throw new Error(`Sheet "${sheetName}" is not in this file.`);
  }
  return workbook.Sheets[sheetName];
};

const handlers = {
  open: ({ data }) => {
    workbook = XLSX.read(data, { type: 'array' });
    return { sheets: workbook.SheetNames };
  },
  usedRange: ({ sheetName }) => usedRange(getSheet(sheetName)),
  readRows: ({ sheetName, start, end, hasHeaders }) =>
    readRows(getSheet(sheetName), start, end, hasHeaders)
};

if (process.parentPort) {
  process.parentPort.on('message', ({ data: message }) => {
    const { id, type, payload } = message || {};
    try {
      if (!Object.prototype.hasOwnProperty.call(handlers, type)) {
        throw new Error(`Unknown spreadsheet request "${type}".`);
      }
      process.parentPort.postMessage({ id, ok: true, result: handlers[type](payload || {}) });
    } catch (error) {
      process.parentPort.postMessage({ id, ok: false, error: String(error && error.message) });
    }
  });
}

module.exports = { clampRange, usedRange, readRows, MAX_ROWS, MAX_COLS };
