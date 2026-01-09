#!/bin/bash

# Restaurant Kiosk Launcher - Brave Browser
# This script launches the kiosk application with silent printing enabled

# For LOCAL development (change to production URL when deploying)
URL="http://localhost:5173"

# Uncomment this line when deploying to production:
# URL="https://your-netlify-app.netlify.app"

echo "Launching Restaurant Kiosk with Brave..."
echo "URL: $URL"
echo "Silent printing: ENABLED"
echo ""

brave-browser \
  --kiosk \
  --kiosk-printing \
  --disable-print-preview \
  "$URL"
