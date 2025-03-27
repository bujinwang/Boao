const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create icon.png (blue background with white text)
const iconSize = 1024;
const iconSvg = `
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${iconSize}" height="${iconSize}" fill="#4285F4"/>
  <text x="${iconSize/2}" y="${iconSize/2}" font-family="Arial" font-size="120" text-anchor="middle" fill="white" dominant-baseline="middle">Boao Medical</text>
  <text x="${iconSize/2}" y="${iconSize/2 + 100}" font-family="Arial" font-size="120" text-anchor="middle" fill="white" dominant-baseline="middle">Billing</text>
</svg>
`;

// Create splash.png (white background with blue text)
const splashSvg = `
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${iconSize}" height="${iconSize}" fill="#ffffff"/>
  <text x="${iconSize/2}" y="${iconSize/2}" font-family="Arial" font-size="120" text-anchor="middle" fill="#4285F4" dominant-baseline="middle">Boao Medical</text>
  <text x="${iconSize/2}" y="${iconSize/2 + 100}" font-family="Arial" font-size="120" text-anchor="middle" fill="#4285F4" dominant-baseline="middle">Billing</text>
</svg>
`;

// Create adaptive-icon.png (white background with blue circle)
const adaptiveIconSvg = `
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${iconSize}" height="${iconSize}" fill="#ffffff"/>
  <circle cx="${iconSize/2}" cy="${iconSize/2}" r="400" fill="#4285F4"/>
  <text x="${iconSize/2}" y="${iconSize/2}" font-family="Arial" font-size="100" text-anchor="middle" fill="white" dominant-baseline="middle">Boao</text>
  <text x="${iconSize/2}" y="${iconSize/2 + 100}" font-family="Arial" font-size="100" text-anchor="middle" fill="white" dominant-baseline="middle">Medical</text>
</svg>
`;

// Generate the PNG files
Promise.all([
  sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon.png')),
  
  sharp(Buffer.from(splashSvg))
    .png()
    .toFile(path.join(assetsDir, 'splash.png')),
  
  sharp(Buffer.from(adaptiveIconSvg))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'))
])
.then(() => {
  console.log('All icon files generated successfully!');
})
.catch(err => {
  console.error('Error generating icon files:', err);
});