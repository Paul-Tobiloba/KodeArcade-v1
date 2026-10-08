import { test, expect } from '@playwright/test';
import { missions } from '../src/learning';

test('compact decision view distinguishes DO from ELSE', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet', 'Desktop and narrow phone exercise the compact fallback.');
  await page.goto('/#/learn/words');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  await page.evaluate(({ current, compact }) => {
    type Node = { type: string; fields?: Record<string, string | number>; inputs?: Record<string, { block: Node }>; next?: { block: Node } };
    let decision: Node = { type: 'ka_if_else', fields: { DIRECTION: 'right' }, inputs: { DO: { block: { type: 'ka_right' } }, ELSE: { block: { type: 'ka_up' } } } };
    for (let i = 0; i < 2; i++) decision = { type: 'ka_repeat', fields: { COUNT: 2 }, inputs: { DO: { block: decision } } };
    {
      let last = decision;
      // A legitimate in-progress workspace: unfilled Repeat blocks still need
      // an honest overview while the child is constructing the program.
      for (let i = 0; i < 19; i++) { last.next = { block: { type: 'ka_repeat', fields: { COUNT: 2 } } }; last = last.next.block; }
    }
    const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
    save.current = current;
    save.progress['conditionals-7'] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: decision } }] } } };
    localStorage.setItem('kodearcade-v1', JSON.stringify(save));
  }, { current: missions.findIndex(m => m.id === 'conditionals-7'), compact: info.project.name === 'phone' });
  await page.reload();
  const overview = page.getByRole('region', { name: 'Program steps' });
  await expect(overview).toBeVisible();
  await expect(overview.getByRole('button', { name: /Move right, inside.*IF right clear: DO/ })).toBeVisible();
  await expect(overview.getByRole('button', { name: /Move up, inside.*IF right clear: ELSE/ })).toBeVisible();
  const host = (await page.locator('.blockly-host').boundingBox())!;
  for (const tile of await overview.locator('li>button').all()) {
    const box = (await tile.boundingBox())!;
    if (info.project.name === 'desktop') expect(box.y + box.height).toBeLessThanOrEqual(host.y + host.height);
  }
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: `.impeccable/review/topics-${info.project.name}-branches.png`, fullPage: true });
});
