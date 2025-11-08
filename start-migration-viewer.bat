@echo off
REM Supabase Migration Viewer Startup Script for Windows
REM This script starts a local web server and opens the migration viewer in your browser

echo.
echo ============================================
echo   Supabase Migration Viewer
echo ============================================
echo.

SET PORT=8080

REM Check if Python 3 is available
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting Python HTTP server on port %PORT%...
    echo.
    echo Open your browser and navigate to:
    echo    http://localhost:%PORT%/migration-viewer.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server %PORT%
    goto :end
)

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting Node HTTP server on port %PORT%...
    echo.
    echo Open your browser and navigate to:
    echo    http://localhost:%PORT%/migration-viewer.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npx http-server -p %PORT%
    goto :end
)

REM Check if PHP is available
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting PHP HTTP server on port %PORT%...
    echo.
    echo Open your browser and navigate to:
    echo    http://localhost:%PORT%/migration-viewer.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:%PORT%
    goto :end
)

REM No suitable server found
echo ERROR: No suitable HTTP server found!
echo.
echo Please install one of the following:
echo   - Python 3: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads
echo.
echo Or open migration-viewer.html directly in your browser
echo (some features may not work)
echo.
pause
exit /b 1

:end
