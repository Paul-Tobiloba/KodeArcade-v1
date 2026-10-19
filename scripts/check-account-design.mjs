// Read-only visual checks: synthetic API responses, no accounts or emails created.
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out = '.impeccable/review';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['tablet', 820, 1180]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, classroomLogin: false, classManagement: false, learnerManagement: false, pdfCards: false, cloudProgress: false } }));
    let family = false;
    await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Synthetic review account', email: 'review@example.test', twoFactorEnabled: false }, workspaces: [{ id: 'synthetic', name: family ? 'Example family workspace' : 'Example teaching workspace', kind: family ? 'family' : 'school', role: family ? 'parent' : 'teacher' }], classes: [] } }));
    for (const route of ['login', 'adult-login?role=teacher', 'signup?role=parent', 'student-login', 'dashboard', 'classes', 'learners', 'class-new', 'learner-new', 'account-settings', 'forgot-password', 'check-email', 'two-factor']) {
      await page.goto(`http://127.0.0.1:5173/#/${route}`);
      await page.locator('#account-main h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.account-scenery img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
      await page.evaluate(() => scrollTo(0, 0));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      const violations = ['login', 'adult-login?role=teacher', 'student-login', 'dashboard'].includes(route) ? (await new AxeBuilder({ page }).analyze()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) : [];
      results.push({ device, route, overflow, violations });
      if (['login', 'adult-login?role=teacher', 'student-login', 'dashboard'].includes(route)) {
        const name = route === 'login' ? (device === 'tablet' ? 'auth-tablet' : device) : `auth-${route.split('?')[0]}-${device}`;
        await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      }
      if (route === 'student-login') {
        await page.getByRole('button', { name: 'Preview password methods' }).click();
        await page.getByRole('button', { name: 'Sun', exact: true }).click();
        await page.getByRole('button', { name: 'Moon', exact: true }).click();
        await page.getByRole('button', { name: 'Star', exact: true }).click();
        await page.getByRole('button', { name: 'Flower', exact: true }).click();
        await page.screenshot({ path: `${out}/auth-picture-${device}.png`, fullPage: true });
      }
    }
    family = true;
    await page.goto('http://127.0.0.1:5173/#/dashboard');
    await page.getByText('Start an adventure together').waitFor();
    await page.screenshot({ path: `${out}/auth-family-${device}.png`, fullPage: true });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${out}/account-qa.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ checks: results.length, overflow: results.filter(x => x.overflow), accessibility: results.filter(x => x.violations.length) }, null, 2));
