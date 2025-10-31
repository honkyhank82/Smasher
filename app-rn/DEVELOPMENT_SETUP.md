# Smasher App - Development Setup Guide

This guide provides step-by-step instructions to set up the development environment for the Smasher React Native app.

## Prerequisites

1. **Node.js** (v18.x or later)
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Watchman** (macOS/Linux)
   - Install using Homebrew: `brew install watchman`
   - Or follow [official installation guide](https://facebook.github.io/watchman/docs/install.html)

4. **Git**
   - Download and install from [git-scm.com](https://git-scm.com/)

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smasher.git
   cd smasher/app-rn
   ```

2. **Install dependencies**
   ```bash
   # First, install core dependencies
   npm install --legacy-peer-deps
   
   # Then install remaining dependencies
   npm install @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context
   
   # Install Expo modules
   expo install expo-constants expo-device expo-application
   
   # Install Sentry for error tracking
   expo install @sentry/react-native sentry-expo
   ```

3. **Environment Setup**
   - Create a `.env` file in the project root:
     ```
     SENTRY_DSN=your-sentry-dsn
     API_URL=your-api-url
     ENV=development
     ```

## Running the App

1. **Start the development server**
   ```bash
   # For iOS
   expo start --ios
   
   # For Android
   expo start --android
   
   # Or use the web version
   expo start --web
   ```

2. **Using the Expo Go app**
   - Install Expo Go on your iOS/Android device
   - Scan the QR code from the terminal or Expo Dev Tools

## Development Workflow

### Code Style
- We use ESLint and Prettier for code formatting
- Run the linter: `npm run lint`
- Format code: `npm run format`

### Git Hooks
- Pre-commit hooks are set up to run linter and tests
- Make sure to run `npm install` to set up the hooks

## Troubleshooting

### Common Issues

1. **Metro Bundler not starting**
   - Clear Metro cache: `expo start -c`
   - Reset cache: `expo r -c`

2. **iOS Simulator not launching**
   - Make sure Xcode is installed
   - Run `sudo xcode-select --reset`

3. **Android Emulator not starting**
   - Make sure Android Studio is installed
   - Verify ANDROID_HOME is set correctly

## Project Structure

```
app-rn/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   └── types/          # TypeScript type definitions
├── assets/             # Images, fonts, etc.
├── App.tsx             # Main application component
└── app.json            # Expo configuration
```

## Dependencies

### Core Dependencies
- React Native 0.73.4
- Expo SDK 50
- TypeScript 5.3.2
- React Navigation 6.x
- Redux Toolkit (for state management)
- React Query (for data fetching)

### Development Dependencies
- ESLint
- Prettier
- Jest (for testing)
- React Testing Library

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit your changes: `git commit -m "Add your feature"`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
