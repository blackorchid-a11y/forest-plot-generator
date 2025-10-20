@echo off
echo ================================================
echo   Updating Forest Plot Generator to v2.2.0
echo ================================================
echo.

echo [1/5] Checking git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
git commit -m "Release v2.2.0: Add manual ordering, improved spacing controls, and p-value display"
echo.

echo [4/5] Creating git tag v2.2.0...
git tag -a v2.2.0 -m "Version 2.2.0 - Manual Ordering, Enhanced Spacing, and P-Value Display"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
git push origin v2.2.0
echo.

echo ================================================
echo   Successfully updated to v2.2.0!
echo ================================================
echo.
echo New Features:
echo - Manual position control for variable ordering
echo - Separate spacing controls for before/after section titles
echo - Optional p-value display next to OR (95%% CI)
echo - Variable name alignment option (left/right)
echo - Automatic margin adjustment for p-value display
echo - Backward compatibility with old project files
echo.
pause
