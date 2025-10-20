@echo off
echo ================================================
echo   Updating Forest Plot Generator to v2.2.3
echo ================================================
echo.

echo [1/5] Checking git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
git commit -m "Release v2.2.3: Critical crash fix for invalid X-axis ranges and comprehensive validation"
echo.

echo [4/5] Creating git tag v2.2.3...
git tag -a v2.2.3 -m "Version 2.2.3 - Critical Crash Fix and Validation"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
git push origin v2.2.3
echo.

echo ================================================
echo   Successfully updated to v2.2.3!
echo ================================================
echo.
echo Critical Fixes:
echo - Fixed crash when entering invalid X-axis ranges
echo - Added comprehensive input validation
echo - Clear error messages instead of crashes
echo - No more data loss from crashes
echo - Prevents infinite loops in tick generation
echo.
echo New Validations:
echo - Min must be less than Max
echo - Values must be positive (greater than 0)
echo - Range must not be too small
echo - Invalid numbers caught before rendering
echo.
pause
