const test = require('node:test');
const assert = require('node:assert');
const XLSX = require('xlsx');
const { clampRange, usedRange, readRows, MAX_ROWS } = require('../../xlsx-worker.js');

const sheetFrom = (rows) => XLSX.utils.aoa_to_sheet(rows);

test('the patched SheetJS release is installed', () => {
  // 0.18.5 carries CVE-2023-30533 (prototype pollution) and CVE-2024-22363 (ReDoS).
  const [major, minor, patch] = XLSX.version.split('.').map(Number);
  assert.ok(major > 0 || minor > 20 || (minor === 20 && patch >= 3), `xlsx ${XLSX.version}`);
});

test('a one-cell sheet reports that cell, not a guessed A1:E10', () => {
  // Real files write a bare "B2" for this; build it the same way.
  const sheet = { B2: { t: 's', v: 'only' }, '!ref': 'B2' };
  assert.deepStrictEqual(usedRange(sheet), { start: 'B2', end: 'B2' });
});

test('the used range matches what the sheet declares', () => {
  const sheet = sheetFrom([['Study', 'OR'], ['A', 1.2], ['B', 0.8]]);
  assert.deepStrictEqual(usedRange(sheet), { start: 'A1', end: 'B3' });
});

test('a requested range larger than the sheet is cut to the data and flagged', () => {
  const sheet = sheetFrom([['Study', 'OR'], ['A', 1.2]]);
  const { range, truncated, empty } = clampRange(sheet, 'A1', 'Z1000');
  assert.deepStrictEqual(range, { s: { r: 0, c: 0 }, e: { r: 1, c: 1 } });
  assert.strictEqual(truncated, true);
  assert.strictEqual(empty, false);
});

test('a range the sheet cannot satisfy reads as empty rather than throwing', () => {
  const sheet = sheetFrom([['Study', 'OR'], ['A', 1.2]]);
  assert.deepStrictEqual(readRows(sheet, 'FOO', 'BAR', true), { rows: [], truncated: false });
});

test('a sheet declaring an enormous range is capped', () => {
  const sheet = sheetFrom([['x']]);
  sheet['!ref'] = 'A1:A1048576';
  const { range, truncated } = clampRange(sheet, 'A1', 'A1048576');
  assert.strictEqual(range.e.r - range.s.r + 1, MAX_ROWS);
  assert.strictEqual(truncated, true);
});

test('rows are keyed by header text only when the sheet has headers', () => {
  const sheet = sheetFrom([['Study', 'OR'], ['A', 1.2]]);
  assert.deepStrictEqual(readRows(sheet, 'A1', 'B2', true).rows, [{ Study: 'A', OR: 1.2 }]);
  assert.deepStrictEqual(readRows(sheet, 'A1', 'B2', false).rows, [['Study', 'OR'], ['A', 1.2]]);
});
