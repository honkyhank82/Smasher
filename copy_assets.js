const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\honky\\OneDrive\\Pictures';
const rnAssets = 'e:\\Dev\\smasher\\app-rn\\assets';
const webAssets = 'e:\\Dev\\smasher\\app-web';

const copies = [
    { src: 'smasher icon.png', dest: path.join(rnAssets, 'icon.png') },
    { src: 'smasher icon.png', dest: path.join(rnAssets, 'adaptive-icon.png') },
    { src: 'smasher logo.png', dest: path.join(rnAssets, 'logo.png') },
    { src: 'Smasher App Visual Identity Suite.png', dest: path.join(rnAssets, 'splash.png') },
    { src: 'Smasher App Visual Identity Suite.png', dest: path.join(rnAssets, 'welcome-image.png') },
    { src: 'smasher icon.png', dest: path.join(webAssets, 'icon.png') },
    { src: 'smasher icon.png', dest: path.join(webAssets, 'favicon.png') },
    { src: 'smasher logo.png', dest: path.join(webAssets, 'logo.png') }
];

console.log('Starting asset copy...');

copies.forEach(copy => {
    const srcPath = path.join(sourceDir, copy.src);
    const destPath = copy.dest;
    
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ Copied ${copy.src} to ${path.basename(destPath)}`);
        } else {
            console.error(`❌ Source not found: ${srcPath}`);
        }
    } catch (err) {
        console.error(`❌ Error copying ${copy.src}: ${err.message}`);
    }
});

console.log('Done.');
