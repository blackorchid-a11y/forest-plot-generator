@echo off
echo ============================================
echo Forest Plot Generator v2.3.0 Deployment
echo ============================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo Step 2: Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo Step 3: Locating installer...
if exist "dist\Forest_Plot_Generator_Setup_2_3_0.exe" (
    echo ✓ Installer found: Forest_Plot_Generator_Setup_2_3_0.exe
    echo   Location: dist\Forest_Plot_Generator_Setup_2_3_0.exe
) else (
    echo ⚠ Installer not found with expected name
    echo   Checking dist folder...
    dir "dist\*.exe"
)
echo.

echo Step 4: Creating GitHub release files...
if not exist "releases" mkdir releases
if exist "dist\Forest_Plot_Generator_Setup_2_3_0.exe" (
    copy "dist\Forest_Plot_Generator_Setup_2_3_0.exe" "releases\"
    echo ✓ Copied installer to releases folder
)
if exist "dist\Forest_Plot_Generator_Setup_2_3_0.exe.blockmap" (
    copy "dist\Forest_Plot_Generator_Setup_2_3_0.exe.blockmap" "releases\"
    echo ✓ Copied blockmap to releases folder
)
echo.

echo ============================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Next Steps:
echo 1. Test the installer: dist\Forest_Plot_Generator_Setup_2_3_0.exe
echo 2. Verify multi-plot functionality
echo 3. Test layout options (vertical/horizontal)
echo 4. Test plot editor modal
echo 5. Test combined download (SVG/PNG)
echo 6. Create GitHub release v2.3.0
echo 7. Upload files from releases\ folder
echo 8. Include NEW_FEATURES_v2.3.0.md in release notes
echo 9. Include CHANGELOG_v2.3.0.md in release notes
echo.
echo ============================================
echo VERSION 2.3.0 FEATURES:
echo ============================================
echo + Multi-plot support
echo + Layout options (vertical/horizontal)
echo + Full-screen plot editor
echo + Individual plot subtitles
echo + Combined single-file download
echo + Plot management tabs
echo + Auto-save when switching plots
echo + Backward compatible with v2.2.x
echo ============================================
echo.

pause
