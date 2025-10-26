@echo off
REM ================================================
REM  WORKFLOW BUILDER - VIEW LOGS
REM ================================================

echo.
echo Viewing logs from all services...
echo Press Ctrl+C to stop viewing logs
echo.
echo ================================================
echo.

docker-compose logs -f

