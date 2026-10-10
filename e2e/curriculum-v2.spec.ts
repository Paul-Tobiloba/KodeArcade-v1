import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sequenceCore, sequenceExtras } from '../src/topicJourney';
import { drawingActivities } from '../src/drawingActivities';

async function openLoopsLesson(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: 'Loops' }).click();
}

test('Grade 1 topic teaches, assesses and derives its badge without perfect stars', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/learn/grade-1');
  await expect(page.getByRole('region', { name: 'Sequences topic journey' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the mastery mission' })).toBeDisabled();
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).readyState)).toBeGreaterThan(0);
  await video.evaluate(v => { const player = v as HTMLVideoElement; player.currentTime = 15; return player.play(); });
  await expect(page.getByRole('button', { name: 'Introduction reviewed' })).toBeVisible();
  for (let i=0;i<3;i++) await page.getByRole('button', { name: 'Show next step' }).click();
  await expect(page.getByText('Up: row 4, column 3. Byte reached the star!')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/v2-journey-${info.project.name}.png`, fullPage: true });
  await page.evaluate(({ ids }) => {
    const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
    for (const id of ids) save.progress[id] = { blocks: [], attempts: 8, hints: 4, complete: true, lessonSeen: true, stars: 1 };
    localStorage.setItem('kodearcade-v1', JSON.stringify(save));
  }, { ids: [...sequenceCore,sequenceExtras[2],sequenceExtras[3]] });
  await page.reload();
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Try the mastery mission' }).click();
  await page.getByRole('button', { name: 'Choose left, left', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Trace each arrow again' })).toBeVisible();
  await page.getByRole('button', { name: 'Choose right, right', exact: true }).click();
  await page.getByRole('button', { name: 'Choose up, right', exact: true }).click();
  await page.getByRole('button', { name: 'Choose right, right, up', exact: true }).click();
  await page.getByRole('button', { name: 'Back to topic journey' }).click();
  await expect(page.getByRole('heading', { name: 'Sequence Explorer earned!' })).toBeVisible();
  await expect(page.getByText('10 / 50 core stars.', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Grade 5 typed coding stays visible, animates before feedback and preserves both modes', async ({ page }, info) => {
  await page.goto('/#/learn/grade-5');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  const code = 'move_up()\nmove_right()\nmove_right()\nmove_right()\nmove_right()';
  await page.getByLabel('Your text program').fill(code);
  await page.getByRole('button', { name: 'Blocks', exact: true }).click();
  await expect(page.locator('.blocklySvg').first()).toBeVisible();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByLabel('Your text program')).toHaveValue(code);
  await page.reload();
  await expect(page.getByLabel('Your text program')).toHaveValue(code);
  await page.getByLabel('Your text program').focus();
  await page.keyboard.press('Escape'); await page.keyboard.press('Tab');
  await expect(page.getByLabel('Your text program')).not.toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/v2-text-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run code' }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).not.toBeVisible();
  await expect(page.getByText('Running line 1', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 12000 });
});

test('drawing lab teaches exterior turns and remembers code without granting curriculum mastery', async ({ page }, info) => {
  test.setTimeout(60000);
  await page.goto('/#/learn/grade-6');
  await openLoopsLesson(page);
  await page.getByRole('button', { name: 'Open drawing lab' }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  await expect(page.getByRole('img', { name: /White drawing artboard/ })).toHaveCSS('background-color','rgb(255, 255, 255)');
  await expect(page.getByLabel('Your text program')).toHaveAttribute('placeholder',/forward\(40\)/);
  await expect(page.locator('.topbar .game-context')).toContainText('Loops · Drawing 1 of 4');
  await expect(page.locator('.drawing-dash image')).toHaveAttribute('href','/images/dash-pencil.png');
  await page.getByRole('button', { name: 'Drawing tools', exact: true }).click();
  await page.getByRole('button', { name: 'Teal ink', exact: true }).click();
  await page.getByLabel('Pen width', { exact: true }).selectOption('6');
  const code = 'for side in range(8):\n    forward(60)\n    turn(45)';
  await page.getByRole('button', { name: 'Close drawing tools' }).click();
  // Tool-only choices persist without needing a code edit or run.
  await page.getByRole('button', { name: 'Drawing 2: Two rotated stars' }).click();
  await page.getByRole('button', { name: 'Drawing 1: Octagon prediction' }).click();
  await page.getByRole('button', { name: 'Drawing tools', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Teal ink', exact: true })).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel('Pen width', { exact: true })).toHaveValue('6');
  await page.getByRole('button', { name: 'Close drawing tools' }).click();
  await page.getByLabel('Your text program').fill(code);
  await page.getByRole('button', { name: 'Run code' }).click();
  await expect(page.getByRole('dialog', {name:'You made it!'})).not.toBeVisible();
  await expect(page.locator('.drawing-dash')).not.toHaveAttribute('data-x','150');
  await expect(page.getByRole('dialog', {name:'You made it!'})).toBeVisible({timeout:15000});
  await page.getByRole('button', { name: 'Close feedback' }).click();
  if (info.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/v2-drawing-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Read lesson', exact:true }).click();
  await page.getByRole('list', { name: 'Drawing activities' }).getByRole('button', { name: /Octagon prediction/ }).click();
  await expect(page.getByLabel('Your text program')).toHaveValue(code);
  await page.getByRole('button', { name: 'Drawing 3: Stellar dendrite', exact:false }).click();
  await page.getByLabel('Your text program').fill(drawingActivities['grade-6'].find(a => a.id === 'dendrite')!.reference);
  await page.getByRole('button', { name: 'Run code' }).click();
  await expect(page.getByRole('dialog', {name:'You made it!'})).toBeVisible({timeout:15000});
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/v2-dendrite-${info.project.name}.png`, fullPage: true });
  // On smaller screens the progress nav shows a moving five-activity window.
  if (info.project.name !== 'desktop') await page.getByRole('button', {name:'Drawing 2: Two rotated stars',exact:true}).click();
  await page.getByRole('button', { name: /Drawing 1: Octagon prediction/ }).click();
  await expect(page.getByLabel('Your text program')).toHaveValue(code);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress[JSON.parse(localStorage.getItem('kodearcade-v1')!).current]?.complete ?? false)).toBe(false);
});

test('long drawing overview preserves repeat scope and real drawing value ranges', async ({ page }, info) => {
  await page.addInitScript(() => {
    type State = {type:string;id:string;fields?:Record<string,string|number>;next?:{block:State};inputs?:Record<string,{block:State}>};
    let body: State | undefined;
    for (let i=22;i>=0;i--) body = { type:i%2 ? 'ka_draw_turn' : 'ka_draw_forward',id:`draw-${i}`,fields:i%2 ? {VALUE:90,SIDE:'left'} : {VALUE:60},...(body ? {next:{block:body}} : {}) };
    const repeat: State = {type:'ka_draw_repeat',id:'draw-repeat',fields:{COUNT:8},inputs:{DO:{block:body!}}};
    const start: State = {type:'ka_start',id:'draw-start',next:{block:repeat}};
    localStorage.setItem('kodearcade-drawing-v2-grade-3-square',JSON.stringify({workspace:{blocks:{languageVersion:0,blocks:[start]}},mode:'blocks'}));
  });
  await page.goto('/#/learn/grade-3');
  await openLoopsLesson(page);
  await page.getByRole('button',{name:'Open drawing lab'}).click();
  if (info.project.name==='desktop') await page.setViewportSize({width:1308,height:677});
  // Controlled cramped-host fixture exercises the same fallback used whenever
  // Blockly must scale below .55; normal challenge dimensions stay unchanged.
  await page.addStyleTag({content:'.drawing-workspace .editor { height: 340px !important; max-height: 340px; }'});
  const overview = page.getByRole('region',{name:'Program steps'});
  await expect(overview).toBeVisible();
  await overview.getByRole('button',{name:'Step 1: Repeat 8 times',exact:true}).click();
  await expect(page.getByLabel('Selected repeat count')).toHaveAttribute('max','12');
  await page.getByLabel('Selected repeat count').fill('12');
  await overview.getByRole('button',{name:/Step 2: .*inside Repeat ×12: DO/}).click();
  await expect(page.getByLabel('Selected block value')).toHaveAttribute('max','150');
  await page.getByLabel('Selected block value').fill('120');
  await overview.getByRole('button',{name:/Step 3: .*inside Repeat ×12: DO/}).click();
  await expect(page.getByLabel('Selected block value')).toHaveAttribute('max','360');
  await page.getByLabel('Selected block value').fill('144');
  await expect(overview).not.toContainText('IF null');
  const lastStep = overview.getByRole('button',{name:/Step 24: .*inside Repeat ×12: DO/});
  await lastStep.scrollIntoViewIfNeeded();
  await lastStep.click();
  await page.getByLabel('Selected block value').fill('130');
  await expect(lastStep).toContainText('forward 130');
  for (const name of ['Move step earlier','Move step later','Delete selected step']) {
    const control = overview.getByRole('button',{name,exact:true});
    await expect(control).toBeVisible();
    const bounds = await control.boundingBox();
    const region = await overview.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(region!.y + region!.height);
  }
  await overview.getByRole('button',{name:'Move step earlier',exact:true}).click();
  await expect(overview.locator('.step-edit')).toContainText('Step 23');
  await overview.getByRole('button',{name:'Move step later',exact:true}).click();
  await expect(overview.locator('.step-edit')).toContainText('Step 24');
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:`.impeccable/review/v2-drawing-overview-${info.project.name}.png`,fullPage:true});
  await overview.getByRole('button',{name:'Delete selected step',exact:true}).click();
  await expect(overview.locator('ol>li')).toHaveCount(23);
});

test('Grade 1 drawing is arrow-led and progresses through several activities', async ({ page }, info) => {
  await page.goto('/#/learn/grade-1');
  await page.getByRole('button', { name: 'Open drawing lab' }).click();
  await expect(page.getByRole('navigation', {name:'Challenge progress'}).getByRole('button')).toHaveCount(1);
  await expect(page.locator('#drawing-code')).toHaveCount(0);
  await expect(page.locator('.blocklySvg').first()).toBeVisible();
  await page.getByText('Keyboard helpers', {exact:true}).click();
  await page.getByRole('button', {name:'Add block',exact:true}).click();
  await page.getByRole('button', {name:'Add block',exact:true}).click();
  await page.getByRole('button', { name: 'Run code' }).click();
  await expect(page.getByRole('dialog', {name:'You made it!'})).toBeVisible();
  await page.getByRole('button', {name:'Back to module',exact:true}).click();
  await page.getByRole('button', {name:'Next module',exact:true}).click();
  await page.getByRole('button', {name:'Open drawing lab',exact:true}).click();
  await expect(page.getByRole('region', { name: 'Dash drawing challenge' }).getByRole('heading', { name: 'Turn a corner', exact: true })).toBeVisible();
  await page.getByText('Keyboard helpers', {exact:true}).click();
  await page.getByRole('button', {name:'Add block',exact:true}).click();
  await page.locator('#keyboard-move').selectOption('ka_draw_arrow_left');
  await page.getByRole('button', {name:'Add block',exact:true}).click();
  await page.locator('#keyboard-move').selectOption('ka_draw_arrow_forward');
  await page.getByRole('button', {name:'Add block',exact:true}).click();
  await page.getByText('Keyboard helpers', {exact:true}).click();
  await page.getByRole('button', { name: 'Run code' }).click();
  await expect(page.getByRole('dialog', {name:'You made it!'})).toBeVisible();
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.locator('.drawing-heading-pointer')).toHaveAttribute('transform',/rotate\(-90\)/);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/v2-young-drawing-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Drawing activities' }).getByRole('button', { name: /Turn a corner/ })).toContainText('Completed');
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: 'Sequences' }).click();
  await expect(page.getByRole('list', { name: 'Drawing activities' }).getByRole('button', { name: /A little trail/ })).toContainText('Completed');
});
