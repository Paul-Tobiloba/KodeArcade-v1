import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/capabilities', route => route.fulfill({ json: {
    adultAccounts: true, classroomLogin: false, classManagement: false,
    learnerManagement: false, pdfCards: false, cloudProgress: false,
  } }));
});

test('adult sign-in keeps errors generic and does not remember a shared device', async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/auth/sign-in/email', route => {
    submitted = route.request().postDataJSON();
    return route.fulfill({ status: 401, json: { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'private-provider-detail' } });
  });
  await page.goto('/#/adult-login?role=teacher');
  await page.getByLabel('Email address').fill('teacher@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('private-provider-detail')).toHaveCount(0);
  expect(submitted?.rememberMe).toBe(false);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
});

test('signup checks password confirmation before sending credentials', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/auth/sign-up/email', route => {
    requests += 1;
    return route.fulfill({ json: {} });
  });
  await page.goto('/#/signup');
  await page.getByLabel('Your name').fill('Synthetic Teacher');
  await page.getByLabel('Email address').fill('teacher@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
  await page.getByLabel('Confirm password', { exact: true }).fill('different-synthetic-password');
  await page.getByRole('button', { name: 'Create adult account' }).click();
  await expect(page.getByRole('alert')).toContainText('passwords do not match');
  expect(requests).toBe(0);
});

for (const entry of ['signup', 'check-email'] as const) {
  test(`${entry} confirmation gives clear verification instructions without eligibility or development jargon`, async ({ page }, testInfo) => {
    const endpoint = entry === 'signup' ? 'sign-up/email' : 'send-verification-email';
    await page.route(`**/api/auth/${endpoint}`, route => route.fulfill({ json: {} }));
    await page.goto(`/#/${entry}?role=parent`);
    if (entry === 'signup') {
      await page.getByLabel('Your name').fill('Synthetic Parent');
      await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
      await page.getByLabel('Confirm password', { exact: true }).fill('synthetic-password-only');
    }
    await page.getByLabel('Email address').fill('parent@example.test');
    await page.getByRole('button', { name: entry === 'signup' ? 'Create adult account' : 'Resend verification email', exact: true }).click();
    const panel = page.locator('.account-panel');
    await expect(panel.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
    await expect(panel).toContainText('Open the KodeArcade verification email and click the link to verify your email address. The link expires in one hour.');
    await expect(panel).toContainText('Check your spam or junk folder');
    await expect(panel).not.toContainText(/eligible|development|configured test inbox|we.ve sent/i);
    await expect(panel.getByRole('link', { name: 'Resend verification email', exact: true })).toHaveAttribute('href', '/#/check-email?role=parent');
    await expect(panel.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/#/adult-login?role=parent');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/verification-copy-${entry}-${testInfo.project.name}.png`, fullPage: true });
  });
}

test('recovery confirmation preserves account privacy and removes development-only guidance', async ({ page }) => {
  await page.route('**/api/auth/request-password-reset', route => route.fulfill({ json: {} }));
  await page.goto('/#/forgot-password?role=teacher');
  await page.getByLabel('Email address').fill('teacher@example.test');
  await page.getByRole('button', { name: 'Send recovery link', exact: true }).click();
  const panel = page.locator('.account-panel');
  await expect(panel).toContainText('If an eligible adult account matches, a recovery link is on its way. It expires in 15 minutes.');
  await expect(panel).not.toContainText(/development|configured test inbox/i);
  await expect(panel.getByRole('link', { name: 'Request another recovery email', exact: true })).toHaveAttribute('href', '/#/forgot-password?role=teacher');
});

test('recovery tokens are removed from the visible URL and never persisted', async ({ page }) => {
  await page.goto('/#/reset-password?token=synthetic-test-token');
  await expect(page).toHaveURL(/#\/reset-password$/);
  expect(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))).not.toContain('synthetic-test-token');
  await expect(page.getByLabel('Confirm password', { exact: true })).toBeVisible();
});

test('student preview does not collect credentials while its API is unavailable', async ({ page }) => {
  let loginRequests = 0;
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/api/')) loginRequests += 1; });
  await page.goto('/#/student-login');
  await expect(page.getByLabel('Classroom code', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Student username', { exact: true })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Try an activity instead' })).toBeVisible();
  expect(loginRequests).toBe(0);
});

test('unauthenticated workspaces fail closed without displaying a roster', async ({ page }) => {
  await page.route('**/api/account', route => route.fulfill({ status: 401, json: { code: 'UNAUTHORIZED' } }));
  await page.goto('/#/classes');
  await expect(page.getByRole('alert')).toContainText('Sign in to open your workspace');
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('picture password preview supports ordered selection, undo and clear without submitting credentials', async ({ page }) => {
  let writes = 0;
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/api/')) writes += 1; });
  await page.goto('/#/student-login');
  await page.getByRole('button', { name: 'Preview password methods' }).click();
  await page.getByRole('button', { name: 'Sun', exact: true }).click();
  await page.getByRole('button', { name: 'Star', exact: true }).click();
  await expect(page.getByLabel('Picture 1: Sun', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Picture 2: Star', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByLabel('Picture 2: empty', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByLabel('Picture 1: empty', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start learning', exact: true })).toBeDisabled();
  expect(writes).toBe(0);
});

test('parent choice preserves its role through account creation navigation', async ({ page }) => {
  await page.goto('/#/adult-login?role=parent');
  await page.getByRole('link', { name: 'Create an adult account' }).click();
  await expect(page.getByRole('heading', { name: 'Parent sign up' })).toBeVisible();
});

test('login help card stays centered inside the illustrated background', async ({ page }, testInfo) => {
  await page.goto('/#/login');
  await expect(page.getByRole('heading', { name: 'Welcome to KodeArcade' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.account-scenery img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  const panel = await page.locator('.account-choice-panel').boundingBox();
  const help = await page.locator('.account-footnote').boundingBox();
  const background = await page.locator('.account-scenery').boundingBox();
  expect(panel).not.toBeNull();
  expect(help).not.toBeNull();
  expect(background).not.toBeNull();
  expect(Math.abs(help!.x + help!.width / 2 - panel!.x - panel!.width / 2)).toBeLessThan(1);
  expect(help!.y).toBeGreaterThanOrEqual(panel!.y + panel!.height);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const fixedBackground = await page.locator('.account-scenery').boundingBox();
  expect(fixedBackground!.y).toBe(0);
  expect(fixedBackground!.height).toBe(await page.evaluate(() => innerHeight));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/help-card-${testInfo.project.name}.png`, fullPage: true });
});

test('workspace loading uses the branded status and scenery stays fixed when scrolling', async ({ page }, testInfo) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/account', async route => { await pending; await route.fulfill({ json: { profile: { id: 'synthetic-adult', name: 'Synthetic Teacher', email: 'example@example.test', emailVerified: true }, workspaces: [], classes: [] } }); });
  await page.goto('/#/dashboard');
  await expect(page.getByRole('status', { name: 'Loading KodeArcade' })).toBeVisible();
  await expect(page.locator('.account-loading img')).toHaveAttribute('src', '/brand/mark-loading.svg');
  await page.screenshot({ path: `.impeccable/review/workspace-loading-${testInfo.project.name}.png`, fullPage: true });
  release();
  await expect(page.getByRole('heading', { name: 'Welcome, Synthetic Teacher' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const scenery = await page.locator('.account-scenery').boundingBox();
  const world = await page.locator('.account-world').boundingBox();
  expect(scenery!.y).toBe(0);
  expect(scenery!.height).toBe(await page.evaluate(() => innerHeight));
  expect(world!.y + world!.height).toBeCloseTo(scenery!.height, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/workspace-bottom-${testInfo.project.name}.png`, fullPage: false });
});
