@echo off
REM Restaurant Kiosk Launcher
REM Launches the app in full-screen kiosk mode with silent printing

echo Starting Restaurant Kiosk...
echo.
echo Press Ctrl+C to cancel, or wait 3 seconds to launch...
timeout /t 3

REM Launch Chrome in kiosk mode with silent printing
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --disable-features=TranslateUI --disable-session-crashed-bubble http://localhost:5173

REM NOTES:
REM - To exit kiosk mode, press Alt+F4
REM - If Chrome is installed in a different location, update the path above
REM - For production, replace http://localhost:5173 with your live URL
