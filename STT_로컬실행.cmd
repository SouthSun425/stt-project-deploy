@echo off
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start_local.ps1"
if errorlevel 1 (
  echo.
  echo Startup failed. Check the error message above.
  pause
)
