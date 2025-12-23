#!/bin/bash
set -e

echo "Starting APK build process..."

# Navigate to app-rn
cd app-rn

echo "Installing app dependencies..."
npm install

echo "Building APK..."
# Run EAS build
BUILD_JSON="$(eas build --platform android --profile production --non-interactive --json)"

# Save for debugging
echo "$BUILD_JSON" > build-output.json

# Extract URL
APK_URL="$(echo "$BUILD_JSON" | jq -r '.[0].artifacts[0].applicationArchiveUrl // .[0].applicationArchiveUrl // .artifacts[0].applicationArchiveUrl // .applicationArchiveUrl // empty')"

if [ -z "$APK_URL" ] || [ "$APK_URL" = "null" ]; then
  echo "Failed to find APK URL in build output" >&2
  cat build-output.json >&2
  exit 1
fi

echo "Downloading APK from $APK_URL"
mkdir -p ../build
curl -L -o ../build/app.apk "$APK_URL"

echo "APK downloaded to build/app.apk"
