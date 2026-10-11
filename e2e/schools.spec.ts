import { expect, test } from '@playwright/test';

const personal = '00000000-0000-4000-8000-000000000001';
const school = '00000000-0000-4000-8000-000000000002';
const classId = '00000000-0000-4000-8000-000000000003';
const teacherId = 'sample-teacher', adminId = 'sample-admin';
test.beforeEach(async ({ page }) => {
  const members = [{ userId: adminId, name: 'Sample Administrator', email: 'admin@example.test', role: 'school_admin' }, { userId: teacherId, name: 'Sample Teacher', email: 'teacher@example.test', role: 'teacher' }];
  let invitations: object[] = [];
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, classManagement: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Administrator', email: 'admin@example.test' }, workspaces: [{ id: personal, name: 'My teaching workspace', kind: 'teacher_workspace', role: 'teacher' }, { id: school, name: 'Sample Academy', kind: 'school', role: 'school_admin' }], classes: [{ id: 'personal-class', organizationId: personal, name: 'Personal coding club', grade: 2, code: 'PRIVATE2' }, { id: classId, organizationId: school, name: 'Grade 2A', grade: 2, code: 'SAMPLE24' }] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 300 } }));
  await page.route(`**/api/schools/${school}`, route => route.fulfill({ json: { workspace: { id: school, name: 'Sample Academy', role: 'school_admin' }, actorId: adminId, members, invitations, classes: [{ id: classId, name: 'Grade 2A', archivedAt: null, staffIds: [teacherId] }] } }));
  await page.route(`**/api/schools/${school}/invitations`, route => {
    const body = route.request().postDataJSON(); expect(body.role).toBe('teacher'); expect(body.operationKey).toBeTruthy();
    invitations = [{ id: 'sample-invite', email: body.email, role: body.role, expiresAt: '2026-10-18T12:00:00Z' }];
    return route.fulfill({ json: { url: 'http://127.0.0.1:5173/#/school-join?token=synthetic-example-only' } });
  });
  await page.route(`**/api/schools/${school}/invitations/*/revoke`, route => { invitations = []; return route.fulfill({ json: { saved: true } }); });
});
test('workspace switcher separates personal and school classes and preserves school context', async ({ page }) => {
  await page.goto('/#/classes');
  await expect(page.getByRole('row', { name: /Personal coding club/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Grade 2A/ })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Workspace', exact: true }).selectOption(school);
  await expect(page.getByRole('heading', { name: 'Welcome, Sample Administrator' })).toBeVisible();
  await page.getByRole('link', { name: 'Manage classes', exact: true }).click();
  await expect(page.getByRole('row', { name: /Grade 2A/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Personal coding club/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Create class', exact: true })).toHaveAttribute('href', `/#/class-new?workspace=${school}`);
  await expect(page.getByRole('link', { name: 'Open class', exact: true })).toHaveAttribute('href', `/#/classroom?id=${classId}&workspace=${school}`);
});
test('school administration shows scoped staff, private invitation and accessible assignments', async ({ page }, info) => {
  await page.goto(`/#/schools?workspace=${school}`);
  await expect(page.getByRole('heading', { name: 'School staff (2)' })).toBeVisible();
  await expect(page.getByText('Last administrator — add another before changing access.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-admin-${info.project.name}.png`, fullPage: true });
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-admin-top-${info.project.name}.png` });
  await page.getByRole('button', { name: 'Invite staff', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`school`));
  await page.getByLabel('Staff email', { exact: true }).fill('colleague@example.test');
  await page.getByRole('button', { name: 'Generate invitation link' }).click();
  await expect(page.getByRole('region', { name: 'Private invitation link' })).toBeVisible();
  await expect(page.getByText(/No email has been sent/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Pending invitations' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-invitation-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Revoke invitation for colleague@example.test' }).click();
  await expect(page.getByRole('region', { name: 'Private invitation link' })).toHaveCount(0);
  await page.getByText('Manage Sample Teacher', { exact: true }).click();
  await page.getByLabel('Access for Sample Teacher').selectOption('remove');
  await expect(page.getByRole('button', { name: 'Save staff access' })).toBeEnabled();
  await page.getByText('Grade 2A · 1 assigned', { exact: true }).click();
  await expect(page.getByRole('group', { name: 'Staff assigned to Grade 2A' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save class staff' })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Sample Administrator · Administrator' }).check();
  await expect(page.getByRole('button', { name: 'Save class staff' })).toBeEnabled();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-access-${info.project.name}.png`, fullPage: true });
});
test('joining explains role and preserves personal workspace, then accepts explicitly', async ({ page }, info) => {
  await page.route('**/api/schools/invitation', route => route.fulfill({ json: { name: 'Sample Academy', role: 'teacher', expiresAt: '2026-10-18T12:00:00Z' } }));
  await page.route('**/api/schools/accept', route => { expect(route.request().postDataJSON()).toEqual({ token: 'synthetic-example-only', confirm: true }); return route.fulfill({ json: { id: school } }); });
  await page.goto('/#/school-join?token=synthetic-example-only');
  await expect(page.getByRole('heading', { name: 'Sample Academy', exact: true })).toBeVisible();
  await expect(page.getByText(/Your personal workspace and existing classes will not change/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-join-${info.project.name}.png`, fullPage: true });
  await page.getByRole('checkbox', { name: 'Join Sample Academy with this school role.' }).check();
  await page.getByRole('button', { name: 'Accept invitation' }).click();
  await expect(page.getByRole('combobox', { name: 'Workspace', exact: true })).toHaveValue(school);
});
test('school creation requires authority confirmation and does not convert the current workspace', async ({ page }, info) => {
  await page.route('**/api/schools', route => { const body = route.request().postDataJSON(); expect(body).toMatchObject({ name: 'Sample Academy', confirmAuthority: true }); expect(body.operationKey).toBeTruthy(); return route.fulfill({ json: { id: school } }); });
  await page.goto(`/#/schools?workspace=${personal}`);
  await page.getByText('Create a separate school workspace', { exact: true }).click();
  await page.getByLabel('School name', { exact: true }).fill('Sample Academy');
  await expect(page.getByRole('combobox', { name: 'Workspace', exact: true })).toHaveValue(personal);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-create-${info.project.name}.png`, fullPage: true });
  await page.getByRole('checkbox', { name: 'I am authorized to administer this school.' }).check();
  await page.getByRole('button', { name: 'Create school workspace', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'School staff (2)' })).toBeVisible();
});

test('lost creation response retries the same key and reconciles without a duplicate', async ({ page }) => {
  let operationKey = '', attempts = 0;
  await page.route('**/api/schools', route => {
    const body = route.request().postDataJSON(); attempts++;
    if (!operationKey) operationKey = body.operationKey;
    expect(body.operationKey).toBe(operationKey);
    return attempts === 1 ? route.abort('failed') : route.fulfill({ json: { id: school } });
  });
  await page.goto(`/#/schools?workspace=${personal}`);
  await page.getByText('Create a separate school workspace', { exact: true }).click();
  await page.getByLabel('School name', { exact: true }).fill('Sample Academy');
  await page.getByRole('checkbox', { name: 'I am authorized to administer this school.' }).check();
  await page.getByRole('button', { name: 'Create school workspace', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Cannot reach');
  await page.getByRole('button', { name: 'Create school workspace', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'School staff (2)' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('lost invitation responses recover with deliberate new keys and replacement guidance', async ({ page }, info) => {
  const keys: string[] = [];
  await page.route(`**/api/schools/${school}/invitations`, route => {
    const key = route.request().postDataJSON().operationKey as string; keys.push(key);
    if (keys.length === 1 || keys.length === 3) return route.abort('failed');
    if (keys.length === 2 || keys.length === 4) return route.fulfill({ status: 409, json: { code: 'ALREADY_PROCESSED' } });
    return route.fulfill({ json: { url: 'http://127.0.0.1:5173/#/school-join?token=synthetic-replacement-only' } });
  });
  await page.goto(`/#/schools?workspace=${school}`);
  await expect(page.getByRole('heading', { name: 'School staff (2)' })).toBeVisible();
  await page.getByLabel('Staff email', { exact: true }).fill('colleague@example.test');
  await page.getByRole('button', { name: 'Generate invitation link' }).click();
  await expect(page.getByRole('alert')).toContainText('Cannot reach');
  await page.getByRole('button', { name: 'Generate invitation link' }).click();
  await expect(page.getByRole('region', { name: 'Replace lost invitation' })).toContainText('previous invitation link will stop working');
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-recovery-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Generate replacement invitation' }).click();
  await expect(page.getByRole('alert')).toContainText('Cannot reach');
  await page.getByRole('button', { name: 'Generate replacement invitation' }).click();
  await expect(page.getByRole('alert')).toContainText('private link was not received');
  await page.getByRole('button', { name: 'Generate replacement invitation' }).click();
  await expect(page.getByRole('region', { name: 'Private invitation link' })).toBeVisible();
  expect(keys[0]).toBe(keys[1]); expect(keys[2]).not.toBe(keys[1]); expect(keys[2]).toBe(keys[3]); expect(keys[4]).not.toBe(keys[3]);
});

test('revoked administration before save hides stale staff and offers workspace refresh', async ({ page }, info) => {
  await page.route(`**/api/schools/${school}/invitations`, route => route.fulfill({ status: 404, json: { code: 'NOT_FOUND' } }));
  await page.goto(`/#/schools?workspace=${school}`);
  await expect(page.getByRole('heading', { name: 'School staff (2)' })).toBeVisible();
  await page.getByLabel('Staff email', { exact: true }).fill('colleague@example.test');
  await page.getByRole('button', { name: 'Generate invitation link' }).click();
  await expect(page.getByRole('heading', { name: 'School access unavailable' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'School staff', exact: true })).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Your access may have changed');
  await expect(page.getByRole('button', { name: 'Refresh workspaces' })).toBeVisible();
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/school-access-unavailable-${info.project.name}.png`, fullPage: true });
});
