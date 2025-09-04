@echo off
REM Target Blaster Game Startup Script (Windows)
REM Production-ready development server

echo 🎯 TARGET BLASTER - DEVELOPMENT SERVER
echo ======================================

REM Check if index.html exists
if not exist "index.html" (
    echo ❌ Error: index.html not found in current directory
    echo    Make sure you're running this script from the Target Blaster root directory
    pause
    exit /b 1
)

REM Configuration
set DEFAULT_PORT=8000
set MAX_PORT=8010

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python 3 not found. Please install Python 3 to run the development server.
        echo.
        echo Alternative options:
        echo 1. Install Python 3: https://python.org/downloads
        echo 2. Open index.html directly in your web browser
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

REM Find available port
set PORT=%DEFAULT_PORT%

REM Display startup information
echo 📊 GAME INFORMATION
echo    Version: Production Ready v1.0
echo    Type: HTML5 Canvas Arcade Shooter
echo    Monetization: Google AdSense Ready
echo.
echo 🚀 SERVER CONFIGURATION
echo    Python: 
%PYTHON_CMD% --version
echo    Port: %PORT%
echo    URL: http://localhost:%PORT%
echo    Directory: %CD%
echo.
echo 💰 MONETIZATION STATUS
findstr /C:"ca-pub-XXXXXXXXXX" js\ads.js >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  AdSense: Demo mode ^(replace publisher ID in js\ads.js^)
) else (
    echo    ✅ AdSense: Configured for production
)
echo    📈 Analytics: Ready for integration
echo    🎯 Revenue: Banner + Interstitial + Rewarded Video ads
echo.
echo 🎮 STARTING TARGET BLASTER...
echo    Press Ctrl+C to stop the server
echo    View in browser: http://localhost:%PORT%
echo.

REM Auto-open browser
timeout /t 2 /nobreak >nul
start http://localhost:%PORT%

REM Start Python HTTP server
%PYTHON_CMD% -m http.server %PORT%