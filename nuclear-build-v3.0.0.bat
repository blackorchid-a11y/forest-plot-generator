@echo off
echo ============================================
echo Forest Plot Generator v3.0.0 Deployment
echo (Nuclear option - multiple retries)
echo ============================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Step 1: Killing ALL Electron processes...
taskkill /F /IM "Forest Plot Generator.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo ✓ Processes terminated
echo.

echo Step 2: Waiting longer for file handles...
timeout /t 5 /nobreak >nul
echo ✓ Wait complete
echo.

echo Step 3: Removing problematic build/icons folder...
if exist "build\icons" (
    rmdir /s /q "build\icons"
    echo ✓ Removed build/icons folder
)
echo.

echo Step 4: Aggressively cleaning dist folder (multiple attempts)...
if exist "dist" (
    echo Attempt 1: Removing dist folder...
    rmdir /s /q dist 2>nul
    timeout /t 2 /nobreak >nul
    
    if exist "dist" (
        echo Attempt 2: Removing dist folder...
        rmdir /s /q dist 2>nul
        timeout /t 2 /nobreak >nul
    )
    
    if exist "dist" (
        echo Attempt 3: Using manual file deletion...
        del /F /Q dist\*.* 2>nul
        for /d %%p in (dist\*) do rmdir /s /q "%%p" 2>nul
        timeout /t 2 /nobreak >nul
    )
    
    if exist "dist" (
        echo WARNING: Could not completely remove dist folder
        echo Some files may be locked
        echo.
        echo Please do the following:
        echo 1. Open Task Manager (Ctrl+Shift+Esc)
        echo 2. End ALL electron.exe and node.exe processes
        echo 3. Close this window
        echo 4. Manually delete the dist folder in File Explorer
        echo 5. Run this script again
        pause
        exit /b 1
    ) else (
        echo ✓ Dist folder removed successfully
    )
) else (
    echo ✓ No dist folder to clean
)
echo.

echo Step 5: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo Step 6: Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    echo.
    echo If you see "file is being used by another process" error:
    echo 1. Close this window
    echo 2. Restart your computer
    echo 3. After restart, run this script immediately
    echo 4. Do NOT open Forest Plot Generator before building
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo Step 7: Locating installer...
if exist "dist\Forest_Plot_Generator_Setup_3_0_0.exe" (
    echo ✓ Installer found: Forest_Plot_Generator_Setup_3_0_0.exe
    dir "dist\Forest_Plot_Generator_Setup_3_0_0.exe"
) else (
    echo ⚠ Installer not found with expected name
    echo   Checking dist folder...
    dir "dist\*.exe" 2>nul
)
echo.

echo Step 8: Creating GitHub release files...
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

echo Step 9: Git operations...
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
    echo Note: Nothing to commit or commit failed
)
echo.

echo Creating git tag v3.0.0...
git tag -d v3.0.0 2>nul
git tag -a v3.0.0 -m "Version 3.0.0"
if errorlevel 1 (
    echo ERROR: Could not create tag
    pause
    exit /b 1
)
echo ✓ Tag created successfully
echo.

echo Pushing to GitHub...
git push origin main
echo ✓ Push attempted
echo.

echo Pushing tags to GitHub...
git push origin v3.0.0 --force
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
