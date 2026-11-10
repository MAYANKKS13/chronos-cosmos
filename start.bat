@echo off
echo ===================================================
echo Starting ChronosCosmos 3D Environment Setup...
echo ===================================================

cd /d %~dp0

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Launching ChronosCosmos 3D Web Server...
node server.js
pause
