/**
 * Icon Generator Script
 * 
 * This script generates app icons from the SVG design.
 * 
 * Requirements:
 * npm install sharp
 * 
 * Usage:
 * node generate-icon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG content with the icon design
const svgContent = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Black background -->
  <rect width="1024" height="1024" fill="#000000"/>
  
  <!-- Define gradients for chrome effect -->
  <defs>
    <!-- Chrome outline gradient -->
    <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="20%" style="stop-color:#e8e8e8;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#c0c0c0;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#a0a0a0;stop-opacity:1" />
      <stop offset="80%" style="stop-color:#d0d0d0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
    </linearGradient>
    
    <!-- Inner chrome shine -->
    <linearGradient id="chromeShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
      <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.8" />
    </linearGradient>
    
    <!-- Red gradient for depth -->
    <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ff3333;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#cc0000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Script S letter - Chrome outline (thicker) -->
  <text 
    x="512" 
    y="700" 
    font-family="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive" 
    font-size="720" 
    font-weight="bold"
    font-style="italic"
    text-anchor="middle" 
    fill="none"
    stroke="url(#chromeGradient)" 
    stroke-width="32"
    style="paint-order: stroke;">S</text>
  
  <!-- Script S letter - Inner chrome shine -->
  <text 
    x="512" 
    y="700" 
    font-family="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive" 
    font-size="720" 
    font-weight="bold"
    font-style="italic"
    text-anchor="middle" 
    fill="none"
    stroke="url(#chromeShine)" 
    stroke-width="24"
    opacity="0.6"
    style="paint-order: stroke;">S</text>
  
  <!-- Script S letter - Red fill with gradient -->
  <text 
    x="512" 
    y="700" 
    font-family="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive" 
    font-size="720" 
    font-weight="bold"
    font-style="italic"
    text-anchor="middle" 
    fill="url(#redGradient)"
    style="paint-order: fill;">S</text>
  
  <!-- Highlight for extra chrome effect -->
  <text 
    x="510" 
    y="695" 
    font-family="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive" 
    font-size="720" 
    font-weight="bold"
    font-style="italic"
    text-anchor="middle" 
    fill="none"
    stroke="#ffffff" 
    stroke-width="4"
    opacity="0.4"
    style="paint-order: stroke;">S</text>
</svg>
`;

async function generateIcons() {
  console.log('🎨 Generating app icons...\n');

  try {
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Generate main icon (1024x1024)
    console.log('📱 Generating icon.png (1024x1024)...');
    await sharp(Buffer.from(svgContent))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png created');

    // Generate adaptive icon (1024x1024) - same as main icon for this design
    console.log('📱 Generating adaptive-icon.png (1024x1024)...');
    await sharp(Buffer.from(svgContent))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png created');

    // Generate favicon (48x48)
    console.log('🌐 Generating favicon.png (48x48)...');
    await sharp(Buffer.from(svgContent))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png created');

    console.log('\n✨ All icons generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated icons in the assets folder');
    console.log('2. Run: npx expo prebuild --clean');
    console.log('3. Rebuild your app to see the new icon');
    console.log('\nNote: For iOS, you may need to run: npx expo run:ios');
    console.log('For Android: npx expo run:android');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    console.error('\nMake sure you have sharp installed:');
    console.error('npm install sharp');
  }
}

// Run the generator
generateIcons();
