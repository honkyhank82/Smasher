// Script to set environment-specific configuration
// Usage: node scripts/set-env.js production

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'development';

const configPath = path.join(__dirname, '..', 'src', 'config');
const sourceFile = path.join(configPath, `api.${environment}.ts`);
const targetFile = path.join(configPath, 'api.ts');

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Configuration file not found: ${sourceFile}`);
  console.error(`Available environments: development, production`);
  process.exit(1);
}

try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Environment set to: ${environment}`);
  console.log(`📝 Copied ${sourceFile} to ${targetFile}`);
} catch (error) {
  console.error(`❌ Failed to set environment:`, error.message);
  process.exit(1);
}
