@echo off
REM ================================================
REM  WORKFLOW BUILDER - RUN ALL (Batch Wrapper)
REM ================================================

echo.
echo Starting Workflow Builder...
echo.

REM Run PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0run-all.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error occurred while starting services.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

pause

