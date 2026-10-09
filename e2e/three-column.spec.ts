import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';

test('lesson, activity and code use responsive columns without decorative side terrain', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/learn/grade-3');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  await expect(page.locator('.activity-guide')).toBeVisible();
  await expect(page.locator('.world-scenery')).toHaveCount(0);
  if (info.project.name === 'desktop') {
    await expect(page.locator('.activity-reading')).toBeVisible();
    const readingVisible = await page.locator('.activity-concept').evaluate(el => {
      const slot = el.getBoundingClientRect();
      const listen = el.querySelector('.read-aloud button')!.getBoundingClientRect();
      const prose = el.querySelector('.activity-reading p')!.getBoundingClientRect();
      return listen.bottom <= slot.bottom && prose.top + 40 <= slot.bottom;
    });
    expect(readingVisible).toBe(true);
    const widths = await page.locator('.workspace-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').map(parseFloat));
    expect(widths).toHaveLength(3);
    const total = widths.reduce((a,b) => a+b,0);
    expect(widths.map(w => Math.round(w/total*100))).toEqual([25,30,45]);
    const articleFlow = await page.locator('.activity-guide-content').evaluate(el => {
      const concept = el.querySelector('.activity-concept')!;
      const article = el.querySelector('.activity-reading')!;
      const instructions = el.querySelector('.activity-instructions')!;
      return {
        conceptOverflow: getComputedStyle(concept).overflowY,
        columnOverflow: getComputedStyle(el).overflowY,
        articleBottom: article.getBoundingClientRect().bottom,
        instructionsTop: instructions.getBoundingClientRect().top,
        scrolls: el.scrollHeight > el.clientHeight,
      };
    });
    expect(articleFlow.conceptOverflow).toBe('visible');
    expect(articleFlow.columnOverflow).toBe('auto');
    expect(articleFlow.instructionsTop).toBeGreaterThanOrEqual(articleFlow.articleBottom);
    expect(articleFlow.scrolls).toBe(true);
    const expandedInstructionsTop = articleFlow.instructionsTop;
    await page.locator('.activity-concept > summary').click();
    await expect(page.locator('.activity-reading')).toBeHidden();
    expect((await page.locator('.activity-instructions').boundingBox())!.y).toBeLessThan(expandedInstructionsTop);
    await page.locator('.activity-concept > summary').click();
    await page.locator('.activity-guide-content').evaluate(el => { el.scrollTop = 0; });
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  } else await expect(page.getByRole('button', { name: 'Lesson & instructions' })).toHaveAttribute('aria-expanded','false');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.impeccable/review/three-column-${info.project.name}-byte.png`, fullPage: true });
  await page.getByRole('button', { name: 'Get a hint', exact: true }).click();
  await expect(page.locator('.activity-guide .hint-current')).toBeVisible();
  await expect(page.locator('.activity-guide .hint-current')).not.toBeEmpty();
  if (info.project.name === 'desktop') {
    // Hints follow the full article now, so the same guide scrollbar must
    // reach their controls without scrolling the board or code workspace.
    await expect(page.locator('.activity-hint-heading h2')).toBeInViewport();
    await page.locator('.activity-guide-content').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(page.getByRole('button', { name: 'Show next hint', exact: true })).toBeInViewport();
    expect(await page.locator('.activity-concept').evaluate(el => getComputedStyle(el).overflowY)).toBe('visible');
  }
  await page.getByRole('button', { name: 'Show next hint', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-3-sequences-1'].hints)).toBe(2);
  await page.screenshot({ path: `.impeccable/review/three-column-${info.project.name}-hint.png`, fullPage: true });
  const id = 'grade-3-conditionals-4';
  await page.evaluate(({ id, current, solution }) => {
    const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
    save.current = current;
    save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', workspace: { blocks: { languageVersion: 0, blocks: [{ type:'ka_start',next:{block:solution} }] } } };
    localStorage.setItem('kodearcade-v1',JSON.stringify(save));
  }, { id, current: missions.findIndex(m => m.id===id), solution:gradeSolutions[id] });
  await page.reload();
  await expect(page.locator('.activity-concept')).not.toHaveAttribute('open','');
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-character','Milo');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.impeccable/review/three-column-${info.project.name}-milo.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByRole('button', { name: 'Lesson & instructions' })).toBeVisible();
    await page.getByRole('button', { name: 'Lesson & instructions' }).click();
    await expect(page.locator('.activity-instructions')).toBeVisible();
    await page.screenshot({ path: '.impeccable/review/three-column-compact.png', fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  }
  expect(errors).toEqual([]);
});
