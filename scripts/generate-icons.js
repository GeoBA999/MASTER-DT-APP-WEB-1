import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'pwa-192x192.png', size: 192, pad: false },
    { name: 'pwa-512x512.png', size: 512, pad: false },
    { name: 'pwa-maskable-512x512.png', size: 512, pad: true },
    { name: 'apple-touch-icon.png', size: 180, pad: false },
    { name: 'favicon.ico', size: 64, pad: false }
  ];

  for (const t of targets) {
    const dest = path.resolve('public', t.name);
    if (t.pad) {
      // safe zone for maskable icon: 80% content, padded with background #071410
      const innerSize = Math.round(t.size * 0.8);
      const innerPng = await sharp(svgBuffer).resize(innerSize, innerSize).toBuffer();
      await sharp({
        create: {
          width: t.size,
          height: t.size,
          channels: 4,
          background: { r: 7, g: 20, b: 16, alpha: 1 }
        }
      })
      .composite([{ input: innerPng, gravity: 'center' }])
      .png()
      .toFile(dest);
    } else {
      await sharp(svgBuffer)
        .resize(t.size, t.size)
        .png()
        .toFile(dest);
    }
    console.log(`Generated ${t.name}`);
  }
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
