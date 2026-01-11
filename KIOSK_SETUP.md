# Setting Up Kiosk Mode for Restaurant Application

## Option 1: Desktop PWA + Kiosk Launch (Recommended for Windows)

### Step 1: Create a Windows Shortcut

1. Create a new file: `launch-kiosk.bat`
2. Add this content:

```batch
@echo off
REM Launch Chrome in kiosk mode with silent printing
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --disable-features=TranslateUI http://localhost:5173

REM If you're using the installed PWA app, use this instead:
REM "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --app=http://localhost:5173
```

3. Double-click the `.bat` file to launch

### Step 2: Install as PWA (Optional but Recommended)

1. Open your app in Chrome: `http://localhost:5173`
2. Click the ⋮ menu (three dots)
3. Select "Install [App Name]" or "Create Shortcut"
4. Check "Open as window"

Once installed, update your `.bat` file to use the app URL.

## Option 2: Create Desktop Shortcut Directly

1. Right-click on Desktop → New → Shortcut
2. Enter this as location:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --disable-features=TranslateUI http://localhost:5173
```

3. Name it "Restaurant Kiosk"
4. Click Finish

## Kiosk Flags Explained

| Flag | Purpose |
|------|---------|
| `--kiosk` | Full-screen mode, hides all browser UI |
| `--kiosk-printing` | **Silent printing** - no print dialogs! |
| `--app=URL` | Opens as standalone app window |
| `--disable-features=TranslateUI` | Disables translation popup |
| `--disable-pinch` | Disable pinch zoom on touchscreen |
| `--disable-session-crashed-bubble` | No "restore session" popup |

## For Production (Hosted Website)

When you host your website (e.g., `https://yourdomain.com`), replace `http://localhost:5173` with your live URL:

```batch
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing https://yourdomain.com
```

## Auto-Start on Windows Boot (Optional)

To make it launch automatically when Windows starts:

1. Press `Win + R`
2. Type: `shell:startup`
3. Copy your `.bat` file or shortcut into this folder
4. The app will auto-start in kiosk mode on boot

## Exiting Kiosk Mode

- Press `Alt + F4` to close
- Or `Ctrl + Alt + Delete` → Task Manager → End Chrome

## Testing Kiosk Printing

1. Launch using the shortcut
2. Complete a payment
3. Click "Print Bill & KOT"
4. **Documents should print silently** with no dialogs!

## About the PDF Filename Issue

**In Kiosk Mode**: No issue! Documents print directly, no "Save as PDF" dialog.

**In Normal Mode**: When you manually choose "Save as PDF", Chrome may ask for a filename. This is a browser limitation with iframes - the `document.title` is set correctly in our code, but Chrome doesn't always respect it for iframe prints.

**Solution**: Use kiosk mode for production - that's what it's designed for!
