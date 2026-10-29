@echo off
title MarketHub - Start MongoDB Service
:: Self-elevate to Administrator
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo       MarketHub - Starting MongoDB Database Service
echo ========================================================
echo.
net start MongoDB
if %errorLevel% EQU 0 (
    echo.
    echo [SUCCESS] MongoDB service is now RUNNING!
    echo Node.js / nodemon will now connect automatically on port 27017.
) else (
    echo.
    echo Service returned error %errorLevel%.
    echo If MongoDB is already running, you can test it directly.
)
echo.
echo Press any key to exit...
pause >nul

