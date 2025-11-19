@echo off
echo ============================================
echo Forest Plot Generator v3.0.0 Deployment
echo (with cleanup)
echo ============================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Step 1: Cleaning old build files...
if exist "dist" (
    echo Removing dist folder...
    rmdir /s /q dist
    if errorlevel 1 (
        echo ERROR: Could not remove dist folder
        echo Please close any running instances of the app and try again
        pause
        exit /b 1
    )
    echo ✓ Dist folder removed
) else (
    echo ✓ No dist folder to clean
)
echo.

echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo Step 3: Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo Step 4: Locating installer...
if exist "dist\Forest_Plot_Generator_Setup_3_0_0.exe" (
    echo ✓ Installer found: Forest_Plot_Generator_Setup_3_0_0.exe
    echo   Location: dist\Forest_Plot_Generator_Setup_3_0_0.exe
) else (
    echo ⚠ Installer not found with expected name
    echo   Checking dist folder...
    dir "dist\*.exe"
)
echo.

echo Step 5: Creating GitHub release files...
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

echo Step 6: Git operations...
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
    echo ERROR: git commit failed
    pause
    exit /b 1
)
echo ✓ Changes committed successfully
echo.

echo Creating git tag v3.0.0...
git tag -a v3.0.0 -m "Version 3.0.0"
if errorlevel 1 (
    echo ERROR: git tag failed
    pause
    exit /b 1
)
echo ✓ Tag created successfully
echo.

echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: git push failed
    pause
    exit /b 1
)
echo ✓ Code pushed successfully
echo.

echo Pushing tags to GitHub...
git push origin v3.0.0
if errorlevel 1 (
    echo ERROR: git push tags failed
    pause
    exit /b 1
)
echo ✓ Tag pushed successfully
echo.

echo ============================================
echo BUILD AND PUSH COMPLETED SUCCESSFULLY!
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
