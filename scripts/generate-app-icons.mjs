import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Rasterize the approved vector mark; do not redraw or regenerate the brand.
const brand = new URL('../public/brand/', import.meta.url);
const mark = await readFile(new URL('mark-color.svg', brand), 'utf8');
await mkdir(brand, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, size, fraction] of [
    ['apple-touch-icon.png', 180, .72],
    ['app-icon-192.png', 192, .72],
    ['app-icon-512.png', 512, .72],
    ['app-icon-maskable-512.png', 512, .56],
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;background:#fff}body{display:grid;place-items:center}svg{display:block;width:${Math.round(size * fraction)}px;height:auto}</style></head><body>${mark}</body></html>`);
    await page.screenshot({ path: fileURLToPath(new URL(name, brand)), omitBackground: false });
    await page.close();
    console.log(`${name}: ${size} × ${size}`);
  }
} finally {
  await browser.close();
}
