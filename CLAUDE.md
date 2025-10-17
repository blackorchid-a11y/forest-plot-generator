# Forest Plot Generator - Project Context

## Project Overview
This is an Electron desktop application that generates professional forest plots for meta-analysis visualization. The app allows users to input data, customize plot parameters, and export publication-ready forest plots.

## Tech Stack
- **Electron** v28.0.0 - Desktop app framework
- **React** 18 (via CDN) - UI framework
- **Tailwind CSS** (via CDN) - Styling
- **PapaCSV** - CSV parsing
- **SheetJS (XLSX)** - Excel file processing
- **Lucide React** - Icons

## Project Structure
```
forest-plot-app/
├── main.js           # Electron main process
├── index.html        # HTML entry point
├── app.js            # React application code
├── package.json      # Dependencies and build config
├── .gitignore        # Git ignore rules
├── dist/             # Build output directory
└── .github/workflows/build.yml  # GitHub Actions CI
```

## Key Files
- **main.js**: Electron main process that creates the browser window
- **index.html**: HTML template that loads React, Tailwind, and libraries via CDN
- **app.js**: Contains the React application (forest plot generator UI and logic)
- **package.json**: Project metadata, dependencies, and electron-builder configuration

## Build Commands
```bash
npm start              # Run app in development mode
npm run build          # Build Windows executable (x64)
npm run build-mac      # Build macOS DMG
```

## Development Workflow

### Making Changes
1. Most UI/logic changes go in `app.js`
2. Electron configuration changes go in `main.js`
3. HTML structure changes go in `index.html`
4. Build config changes go in `package.json`

### Testing Changes
- Run `npm start` to test in development
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
- **File handling**: PapaCSV for CSV, XLSX for Excel
- **Icons**: Lucide React icons via createIcon() pattern

## Important Notes
- The app uses `nodeIntegration: true` and `contextIsolation: false` in Electron for direct Node.js access
- All external libraries are loaded via CDN in index.html
- The window starts maximized with no menu bar
- Build artifacts go to `dist/` directory

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
