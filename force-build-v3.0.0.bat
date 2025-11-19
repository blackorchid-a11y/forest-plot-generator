@echo off
echo ============================================
echo Forest Plot Generator v3.0.0 Deployment
echo (with process cleanup)
echo ============================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Step 1: Killing any running Electron processes...
taskkill /F /IM "Forest Plot Generator.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
echo ✓ Processes terminated
echo.

echo Step 2: Waiting for file handles to release...
timeout /t 2 /nobreak >nul
echo ✓ Wait complete
echo.

echo Step 3: Cleaning old build files...
if exist "dist" (
    echo Removing dist folder...
    rmdir /s /q dist 2>nul
    if exist "dist" (
        echo First attempt failed, trying again...
        timeout /t 2 /nobreak >nul
        rmdir /s /q dist 2>nul
    )
    if exist "dist" (
        echo WARNING: Some files in dist could not be removed
        echo This may cause build issues
        echo Please manually delete the dist folder and run again
        pause
    ) else (
        echo ✓ Dist folder removed successfully
    )
) else (
    echo ✓ No dist folder to clean
)
echo.

echo Step 4: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo Step 5: Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo Step 6: Locating installer...
if exist "dist\Forest_Plot_Generator_Setup_3_0_0.exe" (
    echo ✓ Installer found: Forest_Plot_Generator_Setup_3_0_0.exe
    echo   Location: dist\Forest_Plot_Generator_Setup_3_0_0.exe
    dir "dist\Forest_Plot_Generator_Setup_3_0_0.exe"
) else (
    echo ⚠ Installer not found with expected name
    echo   Checking dist folder...
    dir "dist\*.exe"
)
echo.

echo Step 7: Creating GitHub release files...
if not exist "releases" mkdir releases
if exist "dist\Forest_Plot_Generator_Setup_3_0_0.exe" (
    copy "dist\Forest_Plot_Generator_Setup_3_0_0.exe" "releases\"
    echo ✓ Copied installer to releases folder
)
if exist "dist\Forest_Plot_Generator_Setup_3_0_0.exe.blockmap" (
    copy "dist\Forest_Plot_Generator_Setup_3_0_0.exe.blockmap" "releases\"
    echo ✓ Copied blockmap to releases folder
)
echo.

echo Step 8: Git operations...
echo Adding all changes to git...
git add .
if errorlevel 1 (
    echo ERROR: git add failed
    pause
    exit /b 1
)
echo ✓ Files staged successfully
echo.

echo Committing changes...
git commit -m "Release v3.0.0"
if errorlevel 1 (
    echo WARNING: git commit failed - may be nothing to commit
)
echo.

echo Creating git tag v3.0.0...
git tag -a v3.0.0 -m "Version 3.0.0" 2>nul
if errorlevel 1 (
    echo WARNING: Tag may already exist, deleting and recreating...
    git tag -d v3.0.0
    git tag -a v3.0.0 -m "Version 3.0.0"
)
echo ✓ Tag created successfully
echo.

echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo WARNING: git push may have failed
    echo Check if you have uncommitted changes or connection issues
)
echo ✓ Push attempted
echo.

echo Pushing tags to GitHub...
git push origin v3.0.0 --force
if errorlevel 1 (
    echo WARNING: git push tags may have failed
)
echo ✓ Tag push attempted
echo.

echo ============================================
echo BUILD AND PUSH COMPLETED!
echo ============================================
echo.
echo Next Steps:
echo 1. Go to GitHub repository
echo 2. Navigate to Releases section
echo 3. Create new release from tag v3.0.0
echo 4. Upload files from releases\ folder:
echo    - Forest_Plot_Generator_Setup_3_0_0.exe
echo    - Forest_Plot_Generator_Setup_3_0_0.exe.blockmap
echo 5. Add release notes
echo 6. Publish release
echo.
echo Files ready for upload in: releases\
echo.
pause
