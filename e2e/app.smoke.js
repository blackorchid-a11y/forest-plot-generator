// End-to-end smoke test: launches the real Electron app and exercises the paths
// that unit tests cannot reach -- the renderer's isolation, the IPC spreadsheet
// bridge, PNG export under the CSP, and the plot error cards.
//
//   npm run test:smoke        (needs a display; use xvfb-run on a headless box)
//
// Kept outside test/ on purpose: `node --test` auto-discovers everything under
// that directory, and this suite needs a display and an installed Electron.
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { _electron: electron } = require('playwright');
const XLSX = require('xlsx');

const APP = path.join(__dirname, '..');
const ELECTRON = path.join(APP, 'node_modules', 'electron', 'dist', 'electron');

let app;
let win;
const consoleErrors = [];

const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forest-plot-smoke-'));

function writeFixtures() {
  const rows = [
    ['Study', 'Lower CI', 'Odds Ratio', 'Upper CI', 'P-value', 'N', 'Group'],
    ['Trial A', 1.2, 1.5, 1.9, 0.001, 120, 'Adults'],
    ['Trial B', 0.9, 1.1, 1.4, 0.21, 80, 'Adults'],
    ['Trial C', 'N/A', '', 2.0, 'ns', 40, 'Children']
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Data');
  XLSX.writeFile(workbook, path.join(fixtureDir, 'sheet.xlsx'));

  fs.writeFileSync(path.join(fixtureDir, 'swapped.csv'),
    'Study,Lower CI,OR,Upper CI,P-value,N,Group\n' +
    'Trial A,1.2,1.5,1.9,0.001,120,Adults\n');

  fs.writeFileSync(path.join(fixtureDir, 'empty-plots.json'),
    JSON.stringify({ version: '2.0', plots: [] }));

  // An <input type="number"> sanitises "1e400" away, but a project file carries
  // the setting as a raw string straight into state.
  fs.writeFileSync(path.join(fixtureDir, 'overflow-axis.json'), JSON.stringify({
    version: '2.0',
    globalSettings: { mainTitle: 'Axis check', layout: 'vertical', plotWidth: 800, plotHeight: 600 },
    plots: [{
      id: 1,
      title: 'Plot 1',
      data: [{ id: 1, variable: 'A', or: 1.5, lowerCI: 1.2, upperCI: 1.9, pValue: 0.01, sampleSize: '', group: '', color: 'auto', position: 1 }],
      settings: { scale: 'linear', font: 'Arial', fontSize: 14, xAxisMode: 'manual', xAxisMin: '0.1', xAxisMax: '1e400' }
    }]
  }));
}

// Renders the current plot the same way downloadPNG does and decodes the
// result, so a broken export or a CSP that blocks it fails the test.
const exportPng = () => win.evaluate(async () => {
  const svg = document.querySelector('svg');
  const w = Number(svg.getAttribute('width'));
  const h = Number(svg.getAttribute('height'));
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const loaded = await new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  });
  if (!loaded) return { error: 'the SVG could not be rasterised' };

  const scale = 800 / 96;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  if (!blob) return { error: 'toBlob returned null' };

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  return {
    isPNG: [...bytes.slice(0, 4)].join(',') === '137,80,78,71',
    width: view.getUint32(16),
    height: view.getUint32(20),
    bytes: bytes.length
  };
});

const tableRows = () => win.evaluate(() =>
  [...document.querySelectorAll('tbody tr')].map((tr) => {
    const i = tr.querySelectorAll('input');
    return { variable: i[1].value, or: i[2].value, lower: i[3].value, upper: i[4].value };
  }));

test.before(async () => {
  writeFixtures();
  app = await electron.launch({
    executablePath: ELECTRON,
    args: [APP, '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    cwd: APP
  });

  await app.firstWindow();
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // DevTools opens in development, so the app window is selected by URL.
  win = app.windows().find((w) => w.url().includes('index.html'));
  assert.ok(win, 'the app window did not open');

  win.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  win.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text()); });

  await win.waitForLoadState('domcontentloaded');
  await win.waitForTimeout(2000);
  // alert() is a blocking native modal in Electron; capture it instead.
  await win.evaluate(() => { window.__alerts = []; window.alert = (m) => window.__alerts.push(String(m)); });
});

test.after(async () => {
  if (app) await app.close().catch(() => {});
  fs.rmSync(fixtureDir, { recursive: true, force: true });
});

test('the app renders with its libraries loaded locally', async () => {
  const probe = await win.evaluate(() => ({
    react: typeof React,
    papa: typeof Papa,
    core: typeof ForestPlotCore,
    rootChildren: document.getElementById('root').childElementCount,
    // Tailwind is a generated stylesheet, not the CDN JIT compiler.
    background: getComputedStyle(document.querySelector('.bg-gray-50') || document.body).backgroundColor
  }));
  assert.strictEqual(probe.react, 'object');
  assert.strictEqual(probe.papa, 'object');
  assert.strictEqual(probe.core, 'object');
  assert.ok(probe.rootChildren > 0, 'nothing rendered into #root');
  assert.notStrictEqual(probe.background, 'rgba(0, 0, 0, 0)', 'stylesheet did not apply');
});

test('the renderer has no Node access', async () => {
  const isolation = await win.evaluate(() => ({
    require: typeof require,
    process: typeof process,
    module: typeof module,
    buffer: typeof Buffer,
    bridge: typeof window.xlsxBridge
  }));
  assert.strictEqual(isolation.require, 'undefined');
  assert.strictEqual(isolation.process, 'undefined');
  assert.strictEqual(isolation.module, 'undefined');
  assert.strictEqual(isolation.buffer, 'undefined');
  assert.strictEqual(isolation.bridge, 'object', 'the spreadsheet bridge is missing');
});

test('PNG export produces a real PNG at the requested size', async () => {
  const single = await exportPng();
  assert.ok(!single.error, single.error);
  assert.ok(single.isPNG, 'exported bytes are not a PNG');
  assert.strictEqual(single.width, 6667);
  assert.strictEqual(single.height, 5417);

  // A second plot must lengthen the export rather than be cropped out of it.
  await win.getByText('+ Add Plot').click();
  await win.waitForTimeout(1000);
  const twoPlots = await exportPng();
  assert.ok(twoPlots.isPNG);
  assert.strictEqual(twoPlots.height, 10417);
});

test('an invalid axis range shows a visible error card', async () => {
  await win.locator('select').filter({ hasText: 'Automatic (Smart)' }).selectOption('manual');
  await win.waitForTimeout(600);
  await win.getByPlaceholder('e.g., 0.1').first().fill('5');
  await win.getByPlaceholder('e.g., 10').first().fill('2');
  await win.waitForTimeout(1200);

  const card = await win.evaluate(() => ({
    texts: [...document.querySelectorAll('svg text')].map((t) => t.textContent)
      .filter((t) => /Invalid X-Axis Range|must be less than/.test(t)),
    // HTML inside <svg> renders in the SVG namespace and paints nothing.
    htmlInsideSvg: document.querySelectorAll('svg div, svg h3, svg p').length
  }));
  assert.ok(card.texts.length >= 2, 'the error card did not render as SVG text');
  assert.strictEqual(card.htmlInsideSvg, 0);

  // Export must still work while the card is showing.
  const png = await exportPng();
  assert.ok(png.isPNG);

  await win.locator('select').filter({ hasText: 'Manual Control' }).selectOption('auto');
  await win.waitForTimeout(800);
});

test('a non-finite axis max does not freeze the app', async () => {
  // This is the regression test that matters most on this branch: the failure
  // mode was a synchronous infinite loop in tick generation, which no
  // try/catch or ErrorBoundary can recover from, and an unresponsive renderer
  // cannot answer evaluate() at all. The number input sanitises "1e400" away,
  // so the reachable route is a project file, which carries the raw string.
  await win.evaluate(() => { window.__alerts = []; });
  await win.locator('input[accept=".json"]').setInputFiles(path.join(fixtureDir, 'overflow-axis.json'));
  await win.waitForTimeout(2000);

  const state = await win.evaluate(() => ({
    alive: true,
    maxSetting: document.querySelector('input[placeholder="e.g., 10"]')
      ? document.querySelector('input[placeholder="e.g., 10"]').value : null,
    texts: [...document.querySelectorAll('svg text')].map((t) => t.textContent)
  }), { timeout: 10000 });

  assert.ok(state.alive, 'the renderer stopped responding');
  // Assert the card's own wording, not a loose pattern that plot content could
  // satisfy by accident.
  assert.ok(state.texts.includes('Invalid X-Axis Configuration'),
    `no error card; svg text was ${JSON.stringify(state.texts)}`);
  assert.ok(state.texts.some((t) => t.includes('must be a finite number')),
    `card did not explain the overflow: ${JSON.stringify(state.texts)}`);

  // Back to a usable axis for the tests that follow.
  await win.locator('select').filter({ hasText: 'Manual Control' }).selectOption('auto');
  await win.waitForTimeout(800);
});

test('an off-scale interval stays inside the plot area', async () => {
  // Clamping only the lower bound against the lower limit drew this bar
  // backwards, out of the plot and through the OR text column.
  await win.getByText('Add Row').click();
  await win.waitForTimeout(500);

  const cells = win.locator('tbody tr').last().locator('input');
  await cells.nth(1).fill('Way off scale');
  await cells.nth(2).fill('30');
  await cells.nth(3).fill('20');
  await cells.nth(4).fill('50');
  await win.waitForTimeout(400);

  await win.locator('select').filter({ hasText: 'Automatic (Smart)' }).selectOption('manual');
  await win.waitForTimeout(600);
  await win.getByPlaceholder('e.g., 0.1').first().fill('0.1');
  await win.getByPlaceholder('e.g., 10').first().fill('10');
  await win.waitForTimeout(1200);

  const geometry = await win.evaluate(() => {
    const svg = document.querySelector('svg');
    const width = Number(svg.getAttribute('width'));
    const xs = [];
    svg.querySelectorAll('line').forEach((l) => {
      xs.push(Number(l.getAttribute('x1')), Number(l.getAttribute('x2')));
    });
    svg.querySelectorAll('path').forEach((pathEl) => {
      (pathEl.getAttribute('d').match(/-?\d+(\.\d+)?/g) || [])
        .forEach((n, i) => { if (i % 2 === 0) xs.push(Number(n)); });
    });
    return { width, min: Math.min(...xs), max: Math.max(...xs) };
  });

  assert.ok(geometry.min >= 0, `a drawn x was left of the plot: ${geometry.min}`);
  assert.ok(geometry.max <= geometry.width,
    `a drawn x ran past the plot width ${geometry.width}: ${geometry.max}`);

  await win.locator('select').filter({ hasText: 'Manual Control' }).selectOption('auto');
  await win.waitForTimeout(800);
});

test('CSV columns are matched by name, not by position', async () => {
  await win.evaluate(() => { window.__alerts = []; });
  await win.getByText('CSV Upload').click();
  await win.waitForTimeout(400);
  await win.locator('input[accept=".csv"]').setInputFiles(path.join(fixtureDir, 'swapped.csv'));
  await win.waitForTimeout(2000);

  const rows = await tableRows();
  // The file lists Lower CI before OR; a positional import would swap them.
  assert.strictEqual(rows[0].or, '1.5');
  assert.strictEqual(rows[0].lower, '1.2');
  assert.strictEqual(rows[0].upper, '1.9');
});

test('Excel imports through the IPC bridge with real column names', async () => {
  await win.evaluate(() => { window.__alerts = []; });
  await win.getByText('Excel Upload').click();
  await win.waitForTimeout(400);
  await win.locator('input[accept=".xlsx"]').setInputFiles(path.join(fixtureDir, 'sheet.xlsx'));
  await win.waitForTimeout(2500);

  await win.getByRole('button', { name: 'Data', exact: true }).click();
  await win.waitForTimeout(1000);

  const headersTicked = await win.evaluate(() => {
    const label = [...document.querySelectorAll('label')]
      .find((l) => l.innerText.includes('First row contains column headers'));
    return label ? label.querySelector('input[type="checkbox"]').checked : null;
  });
  assert.strictEqual(headersTicked, true);

  await win.getByRole('button', { name: 'Next' }).click();
  await win.waitForTimeout(1000);

  // With headers ticked the dropdowns must offer header text, not 0,1,2,3.
  const options = await win.evaluate(() =>
    [...document.querySelector('select').options].map((o) => o.value));
  assert.ok(options.includes('Odds Ratio'), `got ${JSON.stringify(options)}`);
  assert.ok(!options.includes('0'), 'columns came back as array indices');

  await win.evaluate(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    const want = ['Study', 'Odds Ratio', 'Lower CI', 'Upper CI', 'P-value', 'N', 'Group'];
    [...document.querySelectorAll('select')].forEach((sel, i) => {
      if (want[i] && [...sel.options].some((o) => o.value === want[i])) {
        setter.call(sel, want[i]);
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
  await win.waitForTimeout(600);
  await win.getByRole('button', { name: 'Import Data' }).click();
  await win.waitForTimeout(2000);

  const rows = await tableRows();
  assert.strictEqual(rows.length, 3, 'the header row was imported as data');
  assert.strictEqual(rows[0].or, '1.5');
  // "N/A" and a blank must stay empty rather than become 1.0 / 0.8.
  assert.strictEqual(rows[2].or, '');
  assert.strictEqual(rows[2].lower, '');
});

test('a project with no plots is rejected without taking the app down', async () => {
  await win.evaluate(() => { window.__alerts = []; });
  await win.locator('input[accept=".json"]').setInputFiles(path.join(fixtureDir, 'empty-plots.json'));
  await win.waitForTimeout(1500);

  const alerts = await win.evaluate(() => window.__alerts);
  assert.ok(alerts.some((a) => /no plots/i.test(a)), `alerts were ${JSON.stringify(alerts)}`);

  const alive = await win.evaluate(() => ({
    heading: (document.querySelector('h1') || {}).textContent,
    hasSvg: !!document.querySelector('svg')
  }));
  assert.strictEqual(alive.heading, 'Forest Plot Generator');
  assert.ok(alive.hasSvg, 'the plot disappeared');
});

test('clearing a numeric field does not blank the plot', async () => {
  await win.locator('input[placeholder="Width"]').fill('');
  await win.waitForTimeout(800);
  assert.ok(await win.evaluate(() => !!document.querySelector('svg')), 'clearing width blanked the plot');

  await win.locator('input[placeholder="Width"]').fill('640');
  await win.waitForTimeout(800);
  const width = await win.evaluate(() => document.querySelector('svg').getAttribute('width'));
  assert.strictEqual(width, '640');
});

test('the window cannot be navigated away from the app', async () => {
  // Dropping a file outside an input used to navigate the window to it,
  // replacing the app and discarding every unsaved plot.
  const target = pathToFileURL(path.join(fixtureDir, 'swapped.csv')).href;
  await win.evaluate((url) => { window.__stillHere = true; window.location.href = url; }, target);
  await win.waitForTimeout(1500);
  assert.ok(win.url().endsWith('/index.html'), `the window moved to ${win.url()}`);
  assert.strictEqual(await win.evaluate(() => window.__stillHere), true);

  await win.evaluate(() => { window.open('file:///'); });
  await win.waitForTimeout(800);
  assert.strictEqual(app.windows().filter((w) => w.url().startsWith('file:')).length, 1,
    'a second window was opened');
});

// Runs last among the UI tests: it resets the page.
test('reloading, the crash screen\'s way out, still works', async () => {
  await win.evaluate(() => { window.__beforeReload = true; window.location.reload(); });
  await win.waitForTimeout(2500);
  const state = await win.evaluate(() => ({
    marker: window.__beforeReload,
    heading: (document.querySelector('h1') || {}).textContent
  }));
  assert.strictEqual(state.marker, undefined, 'the page did not reload');
  assert.strictEqual(state.heading, 'Forest Plot Generator');
});

test('nothing logged an unexpected error along the way', () => {
  // The rejected-project test deliberately provokes one console.error; anything
  // else is a real fault.
  const expected = /Load error:.*(no plots|not look like a Forest Plot)/;
  const unexpected = consoleErrors.filter((e) => !expected.test(e));
  assert.deepStrictEqual(unexpected, []);
  assert.ok(consoleErrors.some((e) => expected.test(e)),
    'the rejected-project test should have logged its error');
});
