@echo off
echo Copying installer to releases folder...
if not exist "releases" mkdir releases

if exist "dist\Forest Plot Generator Setup 3.0.1.exe" (
    copy "dist\Forest Plot Generator Setup 3.0.1.exe" "releases\"
    echo ✓ Copied installer
)

if exist "dist\Forest Plot Generator Setup 3.0.1.exe.blockmap" (
    copy "dist\Forest Plot Generator Setup 3.0.1.exe.blockmap" "releases\"
    echo ✓ Copied blockmap
)

echo.
echo Files in releases folder:
dir "releases\*.*"
echo.
pause
