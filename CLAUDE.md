# Forest Plot Generator - Project Context

## Project Overview
This is an Electron desktop application that generates professional forest plots for meta-analysis visualization. The app allows users to input data, customize plot parameters, and export publication-ready forest plots.

## Tech Stack
- **Electron** v28.0.0 - Desktop app framework
- **React** 18 - UI framework (bundled in `vendor/`, not a CDN)
- **Tailwind CSS** - Styling (a static stylesheet built by the CLI into `vendor/tailwind.css`)
- **PapaParse** - CSV parsing (bundled in `vendor/`)
- **SheetJS (XLSX)** 0.20.3 - Excel parsing, in an isolated utility process
  (`xlsx-worker.js`). Installed through the npm alias `xlsx` → `@e965/xlsx`, since
  SheetJS publishes 0.20.x only on its CDN; do not "upgrade" back to npm's `xlsx@0.18.5`,
  which has known CVEs

All runtime libraries are bundled locally so the app works with no network
access. Nothing is fetched from a CDN at runtime; do not reintroduce one.

## Project Structure
```
forest-plot-app/
├── main.js           # Electron main process + spreadsheet IPC handlers
├── xlsx-worker.js    # Utility process that parses one spreadsheet (SheetJS)
├── preload.js        # contextBridge: the renderer's only privileged API
├── index.html        # HTML entry point (loads vendor/ and lib/ scripts)
├── app.js            # React application code (renderer, no Node access)
├── lib/core.js       # Pure logic: statistics, formatting, parsing, validation
├── vendor/           # Bundled React, ReactDOM, PapaParse, Tailwind CSS
├── test/unit/        # node --test unit tests for lib/core.js
├── e2e/              # Electron smoke test (drives the real app)
├── package.json      # Dependencies and build config
├── dist/             # Build output directory (ignored)
└── .github/workflows/build.yml  # CI: lint + tests, then builds
```

## Key Files
- **main.js**: Electron main process: creates the window, blocks navigation away from
  the app, and runs one `xlsx-worker.js` utility process per open spreadsheet (with
  timeouts)
- **xlsx-worker.js**: holds a workbook and answers `open` / `usedRange` / `readRows`
- **index.html**: HTML template that loads the bundled libraries from `vendor/` and `lib/`, and declares the CSP
- **app.js**: Contains the React application (forest plot generator UI and logic)
- **package.json**: Project metadata, dependencies, and electron-builder configuration

## Build Commands
```bash
npm start              # Run app in development mode
npm test               # Unit tests (fast, no display needed)
npm run test:smoke     # End-to-end test against the real app (needs a display)
npm run lint           # ESLint
npm run build-css      # Regenerate vendor/tailwind.css after changing classes
npm run build          # Build Windows executable (x64)
npm run build-mac      # Build macOS DMG
```
On a headless machine, run the smoke test under a virtual display:
`xvfb-run -a npm run test:smoke`

## Development Workflow

### Making Changes
1. Most UI changes go in `app.js`
2. Pure logic (statistics, formatting, parsing, validation) goes in `lib/core.js`
   so it can be unit tested; `app.js` reads it from the `ForestPlotCore` global
3. Electron configuration and spreadsheet IPC go in `main.js`; spreadsheet parsing
   itself goes in `xlsx-worker.js`
4. Anything the renderer needs from Node must be exposed in `preload.js`
5. HTML structure changes go in `index.html`
6. Build config changes go in `package.json`

If you add Tailwind classes, run `npm run build-css` -- the stylesheet is
generated from the classes it finds in `index.html` and `app.js`.

### Testing Changes
- `npm run lint && npm test` before anything else
- `npm run test:smoke` for changes touching rendering, export, imports or the
  Electron configuration
- Run `npm start` to check it by hand
- Test the built executable after running `npm run build`

### Git Workflow
This project uses Git for version control. The repository is already initialized with:
- Remote: GitHub repository (check `.git/config` for URL)
- Main branch: `main`
- Existing commits tracking app development

### GitHub Integration
To push changes to GitHub:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Dependencies
All dependencies are installed. To reinstall:
```bash
npm install
```

## Code Conventions
- **React**: Uses functional components with hooks
- **Styling**: Tailwind utility classes
- **File handling**: PapaParse for CSV in the renderer; XLSX for Excel in `xlsx-worker.js`, reached through `window.xlsxBridge` → `main.js` IPC
- **Icons**: plain text/emoji in the markup; there is no icon library

## Important Notes
- The renderer is sandboxed: `contextIsolation: true`, `nodeIntegration: false`.
  It has no `require`, `process` or `Buffer`. Anything privileged goes through
  the `xlsxBridge` in `preload.js`, backed by IPC handlers in `main.js`
- The window may not navigate anywhere except a reload of itself (`will-navigate`
  in `main.js`); a dropped file used to replace the app
- `index.html` declares a CSP; inline `<script>` will not run
- All external libraries are bundled in `vendor/`
- The window starts maximized with the menu bar hidden (the menu is still set,
  for its keyboard accelerators)
- DevTools and reload are development-only, gated on `app.isPackaged`
- Build artifacts go to `dist/`; do not commit installers

## Common Tasks

### Adding a New Feature to app.js
1. Locate the relevant React component section
2. Add state with `React.useState()` if needed
3. Implement the feature logic
4. Update the UI with Tailwind classes
5. Test with `npm start`

### Changing Electron Window Settings
1. Edit `main.js` in the `createWindow()` function
2. Modify `BrowserWindow` options (width, height, webPreferences, etc.)

### Updating Build Configuration
1. Edit `package.json` under the "build" key
2. Modify targets, appId, or installer settings
3. Rebuild with `npm run build`

### Adding Dependencies
```bash
npm install <package-name> --save-dev
```

## Distribution
The app is built using electron-builder:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG package

## GitHub Repository
- Repository is tracked in `.git/`
- Check remote URL: `git remote -v`
- Current branch: `main`

## Support Files
- **GitHub Actions**: `.github/workflows/build.yml` for CI/CD
- **Git Ignore**: `.gitignore` excludes node_modules, dist, and build artifacts

## Questions to Ask User
When working on this project, consider asking:
- What specific feature or change needs to be implemented?
- Should changes be committed to git?
- Should changes be pushed to GitHub?
- Does the built executable need to be tested?
- Are there any specific design requirements?

## Common Issues
- If npm commands fail, ensure Node.js and npm are installed
- If Electron won't start, check that dependencies are installed (`npm install`)
- If build fails, check electron-builder configuration in package.json
- For git issues, verify remote repository is accessible

## Next Steps for Development
When Claude Code is asked to make changes:
1. Understand the requested feature/change
2. Identify which files need modification (likely app.js)
3. Make the changes while preserving existing functionality
4. Test the changes with `npm start`
5. If requested, commit changes with a clear message
6. If requested, push to GitHub
7. If requested, build the executable for testing
