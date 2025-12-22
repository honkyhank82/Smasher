#!/usr/bin/env pwsh
# Simple script to install Expo packages

Write-Host "Installing Expo packages..." -ForegroundColor Cyan

# Remove old packages
Write-Host "Removing old packages..." -ForegroundColor Yellow
npm uninstall react-native-geolocation-service react-native-permissions react-native-image-picker react-native-video @react-native/new-app-screen

# Install new Expo packages
Write-Host "Installing new Expo packages..." -ForegroundColor Yellow
npm install expo-location@~17.0.1 expo-image-picker@~15.0.7 expo-av@~14.0.7

Write-Host "Done! Now run: npx expo start --clear" -ForegroundColor Green
