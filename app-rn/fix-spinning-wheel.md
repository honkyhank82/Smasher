# Fix: App Stuck on Spinning Wheel

## 🔄 Problem
App installs but gets stuck on loading spinner/splash screen.

## 🔍 Common Causes
1. Metro bundler not running or on wrong port
2. Device can't connect to Metro (network issue)
3. JavaScript bundle failed to load
4. Firewall blocking connection

## ✅ Quick Fixes

### **Fix 1: Restart Metro on Correct Port**

Metro is now running on http://localhost:8081

**On your device:**
1. Shake the device to open Dev Menu
2. Tap "Settings"
3. Tap "Debug server host & port"
4. Enter: `YOUR_COMPUTER_IP:8081`
5. Go back and tap "Reload"

### **Fix 2: Find Your Computer's IP**

```powershell
# Run this to find your IP
ipconfig | Select-String "IPv4"
```

Look for the IP on your local network (usually 192.168.x.x or 10.0.x.x)

### **Fix 3: Reload the App**

**Method 1: Dev Menu**
- Shake device
- Tap "Reload"

**Method 2: Terminal**
```powershell
# Press 'r' in the Metro terminal to reload
```

**Method 3: Reinstall**
```powershell
# In the app-rn directory
npx expo run:android
```

### **Fix 4: Check Metro Logs**

Watch the Metro terminal for errors. You should see:
```
Waiting on http://localhost:8081
```

When device connects, you'll see:
```
 BUNDLE  ./index.js
```

### **Fix 5: Check Firewall**

Windows Firewall might be blocking Metro:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Node.js" and ensure both Private and Public are checked
4. If not listed, click "Allow another app" and add Node.js

### **Fix 6: Use USB Debugging (Bypass Network)**

```powershell
# Forward port via ADB
adb reverse tcp:8081 tcp:8081

# Then reload app on device
```

## 🎯 Step-by-Step Solution

### **Step 1: Get Your Computer's IP**
```powershell
ipconfig
```
Note the IPv4 address (e.g., 192.168.1.100)

### **Step 2: Configure Device**
1. Shake device → Dev Menu
2. Settings → Debug server host
3. Enter: `192.168.1.100:8081` (use YOUR IP)
4. Save

### **Step 3: Reload**
1. Go back to Dev Menu
2. Tap "Reload"

### **Step 4: Watch Metro**
You should see in Metro terminal:
```
 BUNDLE  ./index.js
 BUNDLE  [android, dev] ./index.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100.0% (1136/1136)
```

## 🔧 Alternative: Use ADB Reverse

If network connection fails, use USB:

```powershell
# Check device is connected
adb devices

# Forward port
adb reverse tcp:8081 tcp:8081

# Reload app
adb shell input text "RR"  # Double-tap R to reload
```

## 🐛 Still Not Working?

### **Check Metro is Actually Running**
```powershell
# Should show Metro on port 8081
netstat -ano | findstr :8081
```

### **Check Device Can Reach Computer**
On device, open browser and go to:
```
http://YOUR_COMPUTER_IP:8081/status
```

Should show: `packager-status:running`

### **Nuclear Option: Clean Everything**
```powershell
# Kill all Metro instances
Get-Process -Name "node" | Stop-Process -Force

# Clean everything
rm -rf node_modules android/build android/.gradle
npm install
npx expo prebuild --clean

# Start fresh
npx expo start --clear
npx expo run:android
```

## 📱 Expected Behavior

When working correctly:

1. **Metro terminal shows:**
   ```
   Waiting on http://localhost:8081
   ```

2. **Device connects:**
   ```
   BUNDLE  ./index.js
   ```

3. **App loads:**
   - Splash screen appears
   - Then transitions to Login/Home screen

## ⚡ Quick Commands

```powershell
# Get your IP
ipconfig | Select-String "IPv4"

# Restart Metro
npx expo start --clear

# Forward port via USB
adb reverse tcp:8081 tcp:8081

# Reload app
# (Shake device → Reload)
```

## 🎯 Most Common Solution

**90% of the time, this fixes it:**

1. Find your computer's IP: `ipconfig`
2. Shake device → Settings → Debug server
3. Enter: `YOUR_IP:8081`
4. Reload app

---

**Metro is currently running on port 8081. Configure your device to connect to it!**
