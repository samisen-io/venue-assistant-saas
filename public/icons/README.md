# PWA Icons

Generate these icons from `/public/icon.svg` before deploying:

## Required Sizes
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Apple Touch Icon
- apple-touch-icon.png (180x180)

Place the apple-touch-icon.png in `/public/` root.

## OG Image
Create `/public/og-image.png` (1200x630) for social media sharing.

## Generation Tools
You can use these tools to generate icons:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Or use a tool like `sharp` in Node.js

## Quick Generation with Sharp (Node.js)
```js
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}x${size}.png`);
});

// Apple touch icon
sharp('icon.svg')
  .resize(180, 180)
  .png()
  .toFile('../apple-touch-icon.png');
```
