import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { emptySave } from '../src/storage';
import { missions } from '../src/learning';
import { collectionSolutions } from '../src/collectionMissions';
import { gradeSolutions } from '../src/gradeMissions';

async function seed(page: Page, id: string, options: { code?: string; empty?: boolean } = {}) {
  const save = emptySave();
  save.course = id.startsWith('grade-5') ? 'grade-5' : 'grade-3';
  save.current = missions.findIndex(m => m.id === id); save.soundEnabled = false;
  save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', codingMode: options.code === undefined ? 'blocks' : 'text', textCode: options.code, workspace: options.empty ? undefined : { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: collectionSolutions[id] ?? gradeSolutions[id] } }] } } };
  await page.addInitScript(save => localStorage.setItem('kodearcade-v1',JSON.stringify(save)),save);
  await page.goto(`/#/learn/${save.course}`);
  await expect(page.locator('.tile-scene')).toBeVisible();
}

for (const [slot, name, selector] of [
  ['conditionals-3','Dash','.collectible-carrot'],
  ['loops-7','Gigi','.collectible-leaf'],
  ['variables-7','Nova','.collectible-acorn'],
  ['conditionals-7','Milo','.gate-locked'],
] as const) test(`${name}: real objects update during execution, not just after feedback`, async ({ page },info) => {
  test.setTimeout(45000);
  const id = `grade-3-${slot}-world-v2`, errors: string[] = [];
  page.on('pageerror',error => errors.push(error.message));
  await seed(page,id);
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-character',name);
  await expect(page.locator(selector).first()).toBeVisible();
  await expect(page.locator('.program-budget')).toContainText('Start does not count');
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308,height: 677 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:`.impeccable/review/world-task-${name.toLowerCase()}-${info.project.name}.png`,fullPage:true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  if (name === 'Milo') await expect(page.locator('.gate-open')).toHaveCount(1,{timeout:12000});
  else await expect(page.locator(selector)).toHaveCount(0,{timeout:25000});
  await expect(page.getByRole('dialog',{name:'You made it!'})).toBeVisible({timeout:15000});
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress[id].complete,id)).toBe(true);
  expect(errors).toEqual([]);
});

test('a river splash is recoverable and a bridge visibly appears before crossing', async ({page},info) => {
  const id = 'grade-5-conditionals-9-world-v2';
  await seed(page,id,{code:'move_right()\nmove_right()'});
  if (info.project.name === 'desktop') await page.setViewportSize({width:1308,height:677});
  await page.screenshot({path:`.impeccable/review/world-task-river-${info.project.name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.character-motion.is-fallen')).toHaveCount(1);
  await expect(page.locator('.character-motion.is-fallen')).toHaveCSS('animation-name','river-splash');
  await expect(page.locator('.retry-toast')).toContainText('Splash');
  await page.getByRole('textbox',{name:'Your text program'}).fill('move_right()\nif bridge_missing():\n    build_bridge()\nmove_right()\nmove_right()\nmove_right()');
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.river-bridge')).toHaveCount(1);
  await expect(page.getByRole('dialog',{name:'You made it!'})).toBeVisible({timeout:15000});
  await page.getByRole('button',{name:'Close feedback'}).click();
  await page.getByRole('button',{name:'Reset position',exact:true}).click();
  await expect(page.locator('.river-bridge')).toHaveCount(0);
});

test('native palette and keyboard additions stop at the activity budget', async ({page}) => {
  const id = 'grade-3-loops-9';
  await seed(page,id,{empty:true});
  const limit = missions.find(m => m.id === id)!.maxBlocks!;
  await page.getByText('Keyboard helpers',{exact:true}).click();
  for (let i=0;i<limit;i++) await page.getByRole('button',{name:'Add block',exact:true}).click();
  await expect(page.locator('.editor-title')).toContainText(`${limit} / ${limit} blocks`);
  await expect(page.locator('.program-budget')).toContainText('Limit reached');
  await page.getByRole('button',{name:'Add block',exact:true}).click();
  await expect(page.locator('.inline-notice')).toContainText(`no more than ${limit}`);
  const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress[id].workspace,id);
  expect(JSON.stringify(saved).match(/"type":"ka_right"/g)).toHaveLength(limit);
  await expect(page.locator('.blocklyFlyout .blocklyDisabled')).not.toHaveCount(0);
});

test('Text mode cannot bypass the limit and existing core slots link to new tasks', async ({page}) => {
  await seed(page,'grade-5-conditionals-3-world-v2',{code:'move_right()\n'.repeat(6)});
  await expect(page.locator('.program-budget')).toContainText('6 / 5 instructions');
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.retry-toast')).toContainText('no more than 5');
  await page.getByRole('button',{name:'Read lesson',exact:true}).click();
  const core = page.getByRole('list',{name:'Core activities'});
  await expect(core.locator('li')).toHaveCount(10);
  await expect(core.locator('li').nth(2)).toContainText('Carrot or clear path');
  await core.locator('li').nth(3).getByRole('button').click();
  await expect(page.locator('.scene-heading')).toContainText('Empty square first');
});

test('Dash wins by collecting five carrots without reaching a finish tile', async ({page},info) => {
  test.setTimeout(45000);
  await seed(page,'grade-5-conditionals-4-world-v2',{code:'for group in range(3):\n    for check in range(5):\n        if item_here():\n            pick_up()\n        else:\n            move_next()'});
  await expect(page.locator('.collectible-carrot')).toHaveCount(5);
  await expect(page.locator('.destination-sprite')).toHaveCount(0);
  await expect(page.locator('.trail-hole')).toHaveCount(2);
  await expect(page.locator('.path-marker')).toHaveCount(9);
  await page.screenshot({path:`.impeccable/review/dash-five-carrots-${info.project.name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'You made it!'})).toBeVisible({timeout:30000});
  await expect(page.getByLabel('Collected items')).toContainText('5 / 5');
  await expect(page.locator('.world-toolbar')).toContainText('All 5 carrots collected');
  await expect(page.locator('.robot-position')).toHaveAttribute('style',/--x: 1; --y: 1/);
  await page.getByRole('button',{name:'Close feedback'}).click();
  await page.getByRole('button',{name:'Reset position',exact:true}).click();
  await expect(page.locator('.collectible-carrot')).toHaveCount(5);
  await expect(page.getByLabel('Collected items')).toContainText('0 / 5');
});

test('old over-budget drafts stay intact and can be repaired', async ({page}) => {
  const id = 'grade-5-loops-9';
  await seed(page,id,{code:'move_right()\n'.repeat(12)});
  const input = page.getByRole('textbox',{name:'Your text program'});
  await expect(input).toHaveValue('move_right()\n'.repeat(12));
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.retry-toast')).toContainText('no more than');
  await expect(input).toHaveValue('move_right()\n'.repeat(12));
});

test('loop drawing counts written instructions and rejects unrolled duplicates', async ({page}) => {
  const id = 'grade-5-loops-1';
  await seed(page,id,{empty:true});
  await page.getByRole('button',{name:'Read lesson',exact:true}).click();
  await page.getByRole('list',{name:'Drawing activities'}).getByRole('button',{name:/Type a hexagon/}).click();
  await expect(page.locator('.program-budget')).toContainText('0 / 3 instructions');
  const input = page.getByRole('textbox',{name:'Your text program'});
  await input.fill('forward(60)\nturn(60)\n'.repeat(6));
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.retry-toast')).toContainText('no more than 3');
  await input.fill('for side in range(6):\n    forward(60)\n    turn(60)');
  await expect(page.locator('.program-budget')).toContainText('3 / 3 instructions');
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'You made it!'})).toBeVisible({timeout:15000});
});
