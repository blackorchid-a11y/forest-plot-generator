// Flat config. The renderer files are plain browser scripts sharing globals via
// <script> tags, so those globals are declared here rather than imported.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  alert: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  Image: 'readonly',
  Blob: 'readonly',
  URL: 'readonly',
  FileReader: 'readonly',
  XMLSerializer: 'readonly',
  btoa: 'readonly',
  unescape: 'readonly',
  performance: 'readonly',
  getComputedStyle: 'readonly',
  Event: 'readonly',
  HTMLSelectElement: 'readonly'
};

const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  process: 'readonly',
  __dirname: 'readonly',
  Buffer: 'readonly',
  globalThis: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

module.exports = [
  {
    // Main process, the spreadsheet worker, preload and tests run under Node.
    files: ['main.js', 'xlsx-worker.js', 'preload.js', 'test/unit/**/*.js', 'eslint.config.js', 'tailwind.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^(event|_)' }]
    }
  },
  {
    // lib/core.js runs in both, via its UMD-style wrapper.
    files: ['lib/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...browserGlobals, ...nodeGlobals }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'error'
    }
  },
  {
    // The smoke test runs under Node but embeds browser code inside
    // page.evaluate() callbacks, so it needs both sets of globals.
    files: ['e2e/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
        React: 'readonly',
        Papa: 'readonly',
        ForestPlotCore: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^(event|_)' }]
    }
  },
  {
    // The renderer. React, ReactDOM, Papa and ForestPlotCore arrive as globals
    // from the <script> tags in index.html.
    files: ['app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...browserGlobals,
        React: 'readonly',
        ReactDOM: 'readonly',
        Papa: 'readonly',
        ForestPlotCore: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_' }]
    }
  }
];
