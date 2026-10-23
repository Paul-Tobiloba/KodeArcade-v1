import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, classManagement: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Administrator', email: 'admin@example.test' }, workspaces: [], classes: [] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 300 } }));
});

test('landing school entry and responsive feature page lead to school signup', async ({ page }, info) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('navigation', { name: 'Choose your account' }).getByRole('link', { name: /Schools Set up your school and team/ })).toBeVisible();
  await page.locator('.landing-account-entries').screenshot({ path: `.impeccable/review/school-entry-home-options-${info.project.name}.png` });
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-entry-home-top-${info.project.name}.png` });
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible()) await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'For schools' }).click();
  await expect(page).toHaveURL(/#\/for-schools$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Big ideas.A whole school.');
  await expect(page.getByRole('navigation', { name: 'Main navigation', includeHidden: true }).getByRole('link', { name: 'For schools', includeHidden: true })).toHaveAttribute('aria-current', 'page');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-entry-${info.project.name}.png`, fullPage: true });
  await page.screenshot({ path: `.impeccable/review/school-entry-top-${info.project.name}.png` });
  await page.getByRole('link', { name: 'Sign up your school', exact: true }).first().click();
  await expect(page).toHaveURL(/#\/signup\?role=school$/);
  await expect(page.getByRole('heading', { name: 'School administrator sign up' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.impeccable/review/school-signup-${info.project.name}.png`, fullPage: true });
});

test('school signup preserves verification intent and does not create a school automatically', async ({ page }) => {
  let schoolWrites = 0;
  await page.route('**/api/schools', route => { schoolWrites += 1; return route.fulfill({ json: {} }); });
  await page.route('**/api/auth/sign-up/email', route => {
    expect(route.request().postDataJSON().callbackURL).toBe('http://127.0.0.1:5173/#/email-verified?role=school');
    return route.fulfill({ json: {} });
  });
  await page.goto('/#/signup?role=school');
  await page.getByLabel('Your name').fill('Sample Administrator');
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-passphrase-only');
  await page.getByLabel('Confirm password', { exact: true }).fill('synthetic-passphrase-only');
  await page.getByRole('button', { name: 'Create adult account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/#/adult-login?role=school');
  await page.goto('/#/email-verified?role=school');
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/#\/adult-login\?role=school$/);
  expect(schoolWrites).toBe(0);
});

test('school sign-in continues through MFA to an expanded explicit school setup', async ({ page }, info) => {
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Administrator', email: 'admin@example.test', twoFactorEnabled: true }, workspaces: [], classes: [] } }));
  await page.route('**/api/auth/sign-in/email', route => route.fulfill({ json: { twoFactorRedirect: true } }));
  await page.route('**/api/auth/two-factor/verify-totp', route => route.fulfill({ json: {} }));
  await page.goto('/#/adult-login?role=school');
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-passphrase-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/#\/two-factor\?role=school$/);
  await page.getByLabel('Authenticator code').fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page).toHaveURL(/#\/schools\?setup=1$/);
  await expect(page.getByLabel('School name', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create school workspace' })).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-entry-setup-${info.project.name}.png`, fullPage: true });
});

test('school recovery keeps its intent and an unenrolled account must enable MFA before setup', async ({ page }) => {
  await page.route('**/api/auth/sign-in/email', route => route.fulfill({ json: {} }));
  await page.route('**/api/auth/request-password-reset', route => {
    expect(route.request().postDataJSON().redirectTo).toContain('/#/reset-password?role=school');
    return route.fulfill({ json: {} });
  });
  await page.goto('/#/adult-login?role=school');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByRole('button', { name: 'Send recovery link' }).click();
  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-passphrase-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/#\/schools\?setup=1$/);
  await expect(page.getByRole('heading', { name: 'Protect your school with two-step verification' })).toBeVisible();
  await expect(page.getByLabel('School name', { exact: true })).toHaveCount(0);
});

test('ordinary adult login still opens dashboard and public school route stays public', async ({ page }) => {
  await page.route('**/api/auth/sign-in/email', route => route.fulfill({ json: {} }));
  await page.goto('/#/adult-login?role=teacher');
  await page.getByLabel('Email address').fill('teacher@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-passphrase-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/#\/dashboard$/);
  await page.route('**/api/account', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/#/for-schools');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A whole school.');
});

test('school navigation remains usable at compact desktop widths', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/#/for-schools');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'For schools' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/school-entry-compact.png', fullPage: true });
});
