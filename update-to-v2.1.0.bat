@echo off
echo ================================================
echo   Updating Forest Plot Generator to v2.1.0
echo ================================================
echo.

echo [1/5] Checking git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
git commit -m "Release v2.1.0: Add section grouping, extended color palette, and smart axis controls"
echo.

echo [4/5] Creating git tag v2.1.0...
git tag -a v2.1.0 -m "Version 2.1.0 - Section Grouping, 55+ Colors, and Smart Axis Controls"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
git push origin v2.1.0
echo.

echo ================================================
echo   Successfully updated to v2.1.0!
echo ================================================
echo.
echo New Features:
echo - Section/group support for organizing forest plots
echo - Extended color palette with 55+ colors
echo - Smart automatic axis scaling
echo - Manual X-axis controls with custom tick marks
echo - Improved logarithmic scale handling
echo.
pause
