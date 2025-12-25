@echo off
echo ==========================================
echo       Starting Little Gourmet System
echo ==========================================

echo [1/3] Checking Database...
:: You might want to uncomment the line below if using Docker
:: docker-compose up -d

echo [2/3] Starting Backend Server...
start "Backend Server (Port 3000)" cmd /k "cd server && echo Installing dependencies... && npm install && echo Starting server... && node app.js"

echo [3/3] Starting Frontend Client...
start "Frontend Client (Port 5173)" cmd /k "cd client && echo Installing dependencies... && npm install && echo Starting frontend... && npm run dev"

echo.
echo ==========================================
echo           System Started!
echo ==========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend UI: http://localhost:5173
echo.
echo Please wait a few seconds for the services to boot up.
echo Then verify by visiting http://localhost:5173 in your browser.
echo.
echo Test Credentials:
echo ID: 1
echo Password: 123456
echo.
pause
