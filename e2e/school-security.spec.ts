import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const workspace = '00000000-0000-4000-8000-000000000001';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, classManagement: true } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 0 } }));
});

test('school setup requires verified MFA, preserves return path and does not create a school early', async ({ page }, info) => {
  let enrolled = false, created = 0;
  await page.route('**/api/account', route => route.fulfill({ json: {
    profile: { name: 'Sample Teacher', email: 'teacher@example.test', twoFactorEnabled: enrolled },
    workspaces: [{ id: workspace, name: 'My teaching', kind: 'teacher_workspace', role: 'teacher' }], classes: [],
  } }));
  await page.route('**/api/schools', route => { created++; return route.fulfill({ json: { id: workspace } }); });
  await page.route('**/api/auth/two-factor/enable', route => route.fulfill({ json: { totpURI: 'otpauth://totp/KodeArcade:sample?secret=JBSWY3DPEHPK3PXP&issuer=KodeArcade', backupCodes: ['SYNTHETIC-ONLY'] } }));
  await page.route('**/api/auth/two-factor/verify-totp', route => { enrolled = true; return route.fulfill({ json: { status: true } }); });
  await page.goto(`/#/schools?setup=1&workspace=${workspace}`);
  await expect(page.getByRole('heading', { name: 'Protect your school with two-step verification' })).toBeVisible();
  await expect(page.getByLabel('School name', { exact: true })).toHaveCount(0);
  expect(created).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/school-mfa-gate-${info.project.name}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Set up two-step verification', exact: true }).click();
  await expect(page.getByText('Required for school administrators', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).include('#account-main').analyze();
  expect(accessibility.violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/school-security-${info.project.name}.png`, fullPage: true });
  await page.getByLabel('Confirm your current password', { exact: true }).fill('Synthetic-adult-passphrase-only');
  await page.getByRole('button', { name: 'Set up two-step verification', exact: true }).click();
  await page.getByLabel('Code from your authenticator', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Confirm two-step verification', exact: true }).click();
  await expect(page.getByRole('button', { name: 'I’ve saved my codes', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'I’ve saved my codes', exact: true }).click();
  await page.getByRole('link', { name: 'Continue school setup', exact: true }).click();
  await expect(page.getByLabel('School name', { exact: true })).toBeVisible();
  expect(created).toBe(0);
});

test('ordinary teachers can unlock for 30 minutes without an authenticator and see MFA as optional', async ({ page }, info) => {
  await page.route('**/api/account', route => route.fulfill({ json: {
    profile: { name: 'Sample Teacher', email: 'teacher@example.test', twoFactorEnabled: false },
    workspaces: [{ id: workspace, name: 'My teaching', kind: 'teacher_workspace', role: 'teacher' }], classes: [],
  } }));
  await page.route('**/api/manage/management/unlock', route => {
    expect(route.request().postDataJSON()).toEqual({ password: 'Synthetic-adult-passphrase-only' });
    return route.fulfill({ json: { unlockedForSeconds: 1800 } });
  });
  await page.goto('/#/class-new');
  await expect(page.getByLabel('Authenticator code', { exact: true })).toHaveCount(0);
  await page.getByLabel('Confirm adult password', { exact: true }).fill('Synthetic-adult-passphrase-only');
  await page.getByRole('button', { name: 'Unlock management', exact: true }).click();
  await expect(page.getByText('Management unlocked', { exact: true })).toBeVisible();
  await page.getByText('Management unlocked', { exact: true }).click();
  await expect(page.getByText(/The 30-minute unlock applies only to this sign-in/)).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/management-unlock-${info.project.name}.png`, fullPage: true });
  await page.goto('/#/account-settings');
  await expect(page.getByText('Optional for parents and teachers.', { exact: false })).toBeVisible();
});

test('admin invitation gates acceptance while teacher invitation does not require enrollment', async ({ page }) => {
  await page.route('**/api/account', route => route.fulfill({ json: {
    profile: { name: 'Sample Teacher', email: 'teacher@example.test', twoFactorEnabled: false },
    workspaces: [{ id: workspace, name: 'My teaching', kind: 'teacher_workspace', role: 'teacher' }], classes: [],
  } }));
  let role = 'school_admin';
  await page.route('**/api/schools/invitation', route => route.fulfill({ json: { name: 'Sample Academy', role, expiresAt: '2026-10-18T12:00:00Z' } }));
  await page.goto('/#/school-join?token=synthetic-example-only');
  await expect(page.getByRole('heading', { name: 'Protect your school with two-step verification' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept invitation' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Set up two-step verification', exact: true })).toHaveAttribute('href', /returnTo=%2Fschool-join%3Ftoken%3Dsynthetic-example-only/);
  role = 'teacher';
  await page.reload();
  await expect(page.getByRole('button', { name: 'Accept invitation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Protect your school with two-step verification' })).toHaveCount(0);
  await expect(page.getByLabel('Authenticator code', { exact: true })).toHaveCount(0);
});
