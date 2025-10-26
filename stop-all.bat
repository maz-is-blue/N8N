@echo off
REM ================================================
REM  WORKFLOW BUILDER - STOP ALL (Batch Wrapper)
REM ================================================

echo.
echo Stopping Workflow Builder...
echo.

REM Run PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error occurred while stopping services.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

pause

