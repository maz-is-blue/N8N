@echo off
REM ================================================
REM  WORKFLOW BUILDER - STATUS (Batch Wrapper)
REM ================================================

powershell.exe -ExecutionPolicy Bypass -File "%~dp0status.ps1"
pause

