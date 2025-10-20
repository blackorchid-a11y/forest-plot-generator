@echo off
echo ================================================
echo   Updating Forest Plot Generator to v2.2.2
echo ================================================
echo.

echo [1/5] Checking git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing changes...
git commit -m "Release v2.2.2: Exact number formatting for OR and CI values"
echo.

echo [4/5] Creating git tag v2.2.2...
git tag -a v2.2.2 -m "Version 2.2.2 - Exact Number Formatting"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
git push origin v2.2.2
echo.

echo ================================================
echo   Successfully updated to v2.2.2!
echo ================================================
echo.
echo New Features:
echo - Exact number formatting for OR and CI values
echo - No unnecessary trailing zeros (0.4 displays as 0.4, not 0.40)
echo - Preserves user input precision exactly
echo - Applies to all OR and CI displays on forest plot
echo.
pause
