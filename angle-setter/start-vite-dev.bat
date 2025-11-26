@echo off
setlocal

:: === CONFIG ===
set "PROJECT_DIR=C:\Users\jorda\Documents\GitHub\uwgas\angle-setter"
set "DEV_URL=http://localhost:5173"
:: ==============

cd /d "%PROJECT_DIR%" || (
    echo [ERROR] Could not change to project directory: %PROJECT_DIR%
    echo Make sure the path is correct.
    pause
    exit /b 1
)

:menu
cls
echo ==============================
echo   Vite Dev Server Control
echo ==============================
echo [1] Start / Restart Vite dev server
echo [2] Open browser only (%DEV_URL%)
echo [3] Exit
echo.
set "choice="
set /p "choice=Select option (1-3): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto open_browser
if "%choice%"=="3" goto end
goto menu

:start_server
cls
echo Starting Vite dev server in:
echo   %PROJECT_DIR%
echo.
echo When you're done, press CTRL+C to stop the server.
echo You will then be returned to this menu.
echo.
:: If you did NOT add --open to package.json, uncomment the next two lines:
echo Opening browser at %DEV_URL% ...
start "" "%DEV_URL%"
::=========================================================================
echo.
npm run dev
echo.
echo ==============================
echo   Vite dev server stopped
echo ==============================
echo.
pause
goto menu

:open_browser
echo Opening browser at %DEV_URL% ...
start "" "%DEV_URL%"
timeout /t 2 >nul
goto menu

:end
endlocal
exit /b 0
