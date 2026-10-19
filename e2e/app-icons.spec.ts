import { expect, test } from '@playwright/test';

test('home-screen metadata provides approved K icons for Apple and Android', async ({ page, context, request }) => {
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.goto('/');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/brand/apple-touch-icon.png');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content', 'KodeArcade');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  const response = await request.get('/site.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({ id: '/', name: 'KodeArcade', start_url: '/', scope: '/', display: 'standalone' });
  expect(manifest.icons).toHaveLength(3);
  const icons = [...manifest.icons, { src: '/brand/apple-touch-icon.png', sizes: '180x180', purpose: 'any' }];
  for (const icon of icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    const png = await response.body(), size = Number(icon.sizes.split('x')[0]);
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
    const pixels = await page.evaluate(async ({ src, size, maskable }) => {
      const image = new Image(); image.src = src; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, size, size).data;
      const colors = new Set<string>(); let opaque = true, safe = true;
      for (let i = 0; i < pixels.length; i += 4) {
        opaque &&= pixels[i + 3] === 255;
        const color = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`;
        colors.add(color);
        if (maskable && color !== '255,255,255') {
          const x = (i / 4) % size + .5, y = Math.floor(i / 4 / size) + .5;
          if (Math.hypot(x - size / 2, y - size / 2) > size * .4) safe = false;
        }
      }
      return { opaque, safe, brand: ['109,74,255', '15,159,143', '246,196,69'].every(color => colors.has(color)) };
    }, { src: icon.src, size, maskable: icon.purpose === 'maskable' });
    expect(pixels).toEqual({ opaque: true, safe: true, brand: true });
  }
  const cdp = await context.newCDPSession(page);
  const parsed = await cdp.send('Page.getAppManifest');
  expect(parsed.url).toContain('/site.webmanifest');
  expect(parsed.errors).toEqual([]);
  await cdp.detach();
});
