import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { ProgressDocument } from '../shared/progress';

// The decorative pointer may extend outside the card. Check the actual content
// and scrolling style rather than counting that pseudo-element as overflow.
function contentFits(panel: HTMLElement | SVGElement) {
  const bounds = panel.getBoundingClientRect(), style = getComputedStyle(panel);
  return style.overflowY === 'visible' && style.maxHeight === 'none' && Array.from(panel.children).filter(child => child.getClientRects().length).every(child => {
    const box = child.getBoundingClientRect(); return box.top >= bounds.top && box.bottom <= bounds.bottom;
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});

test('all six courses start in the real workspace, remember skip and keep module overviews', async ({ page }) => {
  test.setTimeout(90000);
  for (let grade = 1; grade <= 6; grade++) {
    await page.goto(`/#/learn/grade-${grade}`);
    await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible({ timeout: 15000 });
    const tour = page.getByRole('dialog', { name: 'Find your mission' });
    await expect(tour).toBeVisible();
    await expect(page.locator('.lesson-layout')).toHaveCount(0);
    await tour.getByRole('button', { name: 'Skip tour' }).click();
    await expect(page.locator('.replay-tour')).toBeFocused();
    await page.reload();
    await expect(page.locator('.tour-card')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Module overview', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Sequences end-of-module quiz' }).getByRole('button', { name: 'Start quiz', exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Core activities' })).toBeVisible();
    if (grade === 1) {
      await page.getByRole('button', { name: 'Open drawing lab', exact: true }).click();
      await expect(page.locator('.drawing-artboard')).toBeVisible();
    }
  }
});

test('tour permits real block edits and runs, stays in the viewport and can be replayed', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/learn/grade-2');
  const tour = page.locator('.tour-card');
  await expect(tour).toContainText('Find your mission');
  for (let step = 0; step < 5; step++) {
    await expect(tour.locator('h2')).toBeFocused();
    const bounds = (await tour.boundingBox())!, size = page.viewportSize()!;
    expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width); expect(bounds.y + bounds.height).toBeLessThanOrEqual(size.height);
    expect(await tour.evaluate(contentFits)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/onboarding-${info.project.name}-step-${step + 1}.png`, fullPage: false });
    if (step === 1) {
      await page.locator('.blocklyFlyout .ka_arrow_right').click();
      await expect(page.locator('.editor-title')).toContainText('1 / 24 blocks');
    }
    if (step === 2) {
      await expect(tour.getByRole('status').filter({ hasText: 'An instruction is ready' })).toBeVisible();
      await tour.getByRole('button', { name: 'Back', exact: true }).click();
      await expect(tour).toContainText('Choose an instruction');
      await tour.getByRole('button', { name: 'Next', exact: true }).click();
    }
    if (step === 3) {
      await page.getByRole('button', { name: 'Run code', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
      await page.getByRole('button', { name: 'Close feedback' }).click();
      await expect(tour).toContainText('Try it with Play');
    }
    if (step === 4) {
      await page.screenshot({ path: `.impeccable/review/onboarding-${info.project.name}.png`, fullPage: false });
      expect((await new AxeBuilder({ page }).include('.tour-card').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    }
    await tour.getByRole('button', { name: step === 4 ? 'Start exploring' : 'Next', exact: true }).click();
  }
  await page.reload(); await expect(tour).toHaveCount(0);
  await page.getByRole('button', { name: 'Replay tour' }).click(); await expect(tour).toContainText('Find your mission');
  await tour.getByRole('button', { name: 'Skip tour' }).focus(); await page.keyboard.press('Escape');
  await expect(tour).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('short desktop callouts fit their content and sit beside the highlighted area', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Additional check for the reported short-wide viewport.');
  await page.setViewportSize({ width: 1308, height: 590 });
  await page.goto('/#/learn/grade-2');
  const tour = page.locator('.tour-card'), spotlight = page.locator('.tour-spotlight');
  for (let step = 0; step < 5; step++) {
    await expect(tour.locator('h2')).toBeFocused();
    await expect.poll(() => tour.evaluate(contentFits)).toBe(true);
    await expect.poll(async () => {
      const card = (await tour.boundingBox())!, target = (await spotlight.boundingBox())!;
      const gaps = [card.x - target.x - target.width, target.x - card.x - card.width, card.y - target.y - target.height, target.y - card.y - card.height];
      return gaps.some(gap => gap >= 8 && gap <= 20);
    }).toBe(true);
    const box = (await tour.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(590);
    await page.screenshot({ path: `.impeccable/review/onboarding-short-step-${step + 1}.png` });
    await tour.getByRole('button', { name: step === 4 ? 'Start exploring' : 'Next', exact: true }).click();
  }
});

test('typed tour and lesson reading use the existing editor without a separate lesson page', async ({ page }) => {
  await page.goto('/#/learn/grade-5');
  const tour = page.locator('.tour-card');
  await tour.getByRole('button', { name: 'Next', exact: true }).click(); await expect(tour).toContainText('Meet your commands');
  await page.locator('.text-reference summary').click();
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel('Your text program').fill('move_right()');
  await expect(tour).toContainText('An instruction is ready');
  await tour.getByRole('button', { name: 'Skip tour' }).click();
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await expect(page.locator('.activity-concept')).toHaveAttribute('open', '');
  await expect(page.locator('.activity-concept > summary')).toBeFocused();
  await expect(page.getByLabel('Your text program')).toHaveValue('move_right()');
  await expect(page.locator('.lesson-layout')).toHaveCount(0);
});

test('student tour dismissal saves to the scoped account and never imports public tour state', async ({ page }) => {
  const identity = { learnerId: 'tour-learner', classroomId: 'tour-class' };
  let value: ProgressDocument | null = null, revision = 0;
  await page.addInitScript(() => localStorage.setItem('kodearcade-v1', JSON.stringify({ version: 1, course: 'grade-2', progress: { 'grade-2-sequences-1': { blocks: [], attempts: 0, hints: 0, complete: false, workspaceTour: 'completed' } } })));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Learner', classroomName: 'Sample Class', assignments: [{ id: 'tour-assignment', courseKey: 'grade-2' }] } }));
  await page.route('**/api/student/progress/grade-2', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { ...identity, revision, document: value, updatedAt: null } });
    const body = route.request().postDataJSON(); expect(body.learnerId).toBe(identity.learnerId); expect(body.classroomId).toBe(identity.classroomId);
    value = body.document; return route.fulfill({ json: { revision: ++revision } });
  });
  await page.goto('/#/student-play/grade-2'); await expect(page.locator('.tour-card')).toBeVisible();
  await page.getByRole('button', { name: 'Skip tour' }).click();
  await expect.poll(() => value?.progress['grade-2-sequences-1']?.workspaceTour).toBe('skipped');
  await page.reload(); await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible(); await expect(page.locator('.tour-card')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-2-sequences-1'].workspaceTour)).toBe('completed');
});
