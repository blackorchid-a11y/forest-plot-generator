@echo off
echo ================================================
echo   Updating Forest Plot Generator to v2.2.1
echo ================================================
echo.

echo [1/5] Checking git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
git commit -m "Release v2.2.1: Add independent section title font size and enhanced spacing controls"
echo.

echo [4/5] Creating git tag v2.2.1...
git tag -a v2.2.1 -m "Version 2.2.1 - Independent Section Title Font Size and Enhanced Spacing"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
git push origin v2.2.1
echo.

echo ================================================
echo   Successfully updated to v2.2.1!
echo ================================================
echo.
echo New Features:
echo - Independent font size control for section/group titles
echo - Negative spacing values for ultra-tight section layouts
echo - Enhanced spacing control range (-20 to 100 pixels)
echo - Backward compatibility with v2.2.0 projects
echo.
pause
