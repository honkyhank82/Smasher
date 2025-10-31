module.exports = function(api) {
  api.cache(true);
  
  // Remove console in production
  const removeConsolePlugin = [];
  if (process.env.NODE_ENV === 'production') {
    removeConsolePlugin.push('transform-remove-console');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }],
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
      }],
      ['module-resolver', {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@types': './src/types',
          '@config': './src/config',
        },
      }],
      ...removeConsolePlugin,
    ],
  };
};
