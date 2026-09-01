@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0ANCR Sync-project.ps1" %*
exit /b %ERRORLEVEL%
