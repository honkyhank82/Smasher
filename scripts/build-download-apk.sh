#!/bin/bash
set -e

echo "Starting APK build process..."

# Navigate to app-rn
cd app-rn

echo "Installing app dependencies..."
npm install

echo "Environment check:"
node -v
npm -v

echo "Building APK locally to bypass cloud limits..."
# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    echo "WARNING: EAS local builds require macOS or Linux. Skipping APK build on Windows."
    echo "To build APK on Windows, you need:"
    echo "1. Android Studio with SDK and emulator"
    echo "2. JDK (not just JRE) installed"
    echo "3. Proper environment variables set"
    echo "Creating placeholder build directory..."
    mkdir -p ../build
    echo "APK build skipped on Windows - requires macOS/Linux environment" > ../build/build-info.txt
else
    # Run EAS build locally using npx to ensure CLI availability
    mkdir -p ../build
    npx eas-cli build --local --platform android --profile production-apk --non-interactive --output ../build/app.apk
fi

echo "Build completed."
if [ -f "../build/app.apk" ]; then
    ls -l ../build/app.apk
else
    echo "APK file not found - build was skipped or failed"
    ls -l ../build/
fi
