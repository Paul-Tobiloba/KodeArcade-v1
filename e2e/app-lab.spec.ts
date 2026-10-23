import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { progressDocument, type ProgressDocument } from '../shared/progress';

async function preview(page: Page, starter: string) {
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.goto('/#/app-lab');
  await page.getByRole('button', { name: new RegExp(`^${starter}`) }).click();
}
test('design screens and controls, edit an event, save and reopen', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await preview(page, 'Blank app');
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1672, height: 941 });
    await page.screenshot({ path: '.impeccable/review/app-lab-reference-1672.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.screenshot({ path: `.impeccable/review/app-lab-screen-${info.project.name}.png`, fullPage: true });
  const skip = page.getByRole('link', { name: 'Skip to App Lab workspace', exact: true }); await skip.focus(); await skip.press('Enter');
  await expect(page).toHaveURL(/#\/app-lab$/); await expect(page.locator('#app-lab-main')).toBeFocused();
  await page.getByRole('button', { name: 'Button', exact: true }).click();
  await page.getByLabel('Text', { exact: true }).fill('Open my app'); await page.getByLabel('Text', { exact: true }).blur();
  const control = page.getByRole('button', { name: 'Select button1, button', exact: true });
  await expect(control).toHaveText('Open my app');
  await control.focus(); await page.keyboard.press('Shift+ArrowRight');
  await expect(page.getByLabel('X position', { exact: true })).toHaveValue('40');
  await control.scrollIntoViewIfNeeded();
  const box = (await control.boundingBox())!;
  const scale = await page.locator('.al-preview').evaluate(e => e.getBoundingClientRect().width / 320);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 20 * scale, { steps: 4 }); await page.mouse.up();
  await expect(page.getByLabel('Y position', { exact: true })).toHaveValue('60');
  await page.getByLabel('Width', { exact: true }).fill('200'); await page.getByLabel('Width', { exact: true }).blur();
  await expect(control).toHaveCSS('width', '200px');
  await page.getByRole('button', { name: 'Add event blocks', exact: true }).click();
  await expect(page.locator('.al-js-program')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Open my app' }).click();
  await page.locator('.al-console summary').click();
  await expect(page.locator('.al-console pre')).toHaveText('button1 responded');
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  await page.getByRole('button', { name: 'Design', exact: true }).click();
  await page.getByRole('button', { name: 'Add screen', exact: true }).click();
  await page.getByLabel('Screen ID', { exact: true }).fill('details'); await page.getByLabel('Screen ID', { exact: true }).blur();
  await page.getByRole('button', { name: 'Start app on this screen' }).click();
  await page.getByRole('button', { name: 'Label', exact: true }).click();
  await page.getByLabel('Text', { exact: true }).fill('A new screen'); await page.getByLabel('Text', { exact: true }).blur();
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Preview screen', exact: true })).toHaveValue('details');
  await expect(page.getByRole('button', { name: 'Select label1, label' })).toHaveText('A new screen');
  await page.getByRole('combobox', { name: 'Preview screen', exact: true }).selectOption('home');
  await control.click();
  await page.screenshot({ path: `.impeccable/review/app-lab-design-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.app-lab').analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('greeting, counter and data starters work; imports add rather than replace', async ({ page }, info) => {
  await preview(page, 'Hello, app!');
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.locator('.al-js-program')).toBeVisible();
  await page.getByRole('button', { name: 'Edit set text command as text', exact: true }).click();
  await page.getByRole('textbox', { name: 'Edit set text command', exact: true }).fill('setText("message", joinText("Hi, ", getText("nickname")));');
  await page.getByRole('textbox', { name: 'Edit set text command', exact: true }).blur();
  await page.screenshot({ path: `.impeccable/review/app-lab-code-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('textbox', { name: 'nickname', exact: true }).fill('Sample Coder');
  await page.locator('.al-preview').getByRole('button', { name: 'Say hello', exact: true }).click();
  await expect(page.locator('.al-runtime-label')).toHaveText('Hi, Sample Coder');
  await page.locator('.al-preview').getByRole('button', { name: 'Back to start', exact: true }).click();
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  await page.getByRole('button', { name: 'New app', exact: true }).click();
  await page.getByRole('button', { name: /^Tap counter/ }).click();
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Add one' }).click({ clickCount: 3 });
  await expect(page.locator('.al-runtime-label').filter({ hasText: /^3$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await expect(page.locator('.al-runtime-label').filter({ hasText: /^0$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  await page.getByRole('button', { name: 'New app', exact: true }).click();
  await page.getByRole('button', { name: /^Animal explorer/ }).click();
  await page.getByRole('button', { name: 'Data', exact: true }).click();
  await page.getByRole('textbox', { name: 'fact row 0', exact: true }).fill('Sample project-local fact.');
  await page.getByRole('textbox', { name: 'fact row 0', exact: true }).blur();
  await page.screenshot({ path: `.impeccable/review/app-lab-data-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Show a fact' }).click();
  await expect(page.locator('.al-runtime-label').filter({ hasText: 'Sample project-local fact.' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('App-Lab-projects.json');
  const raw = await page.evaluate(() => localStorage.getItem('kodearcade-app-lab-v1:preview')!);
  await page.getByLabel('Import App Lab backup', { exact: true }).setInputFiles({ name: 'apps.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
  await page.locator('.al-library summary').click();
  await expect(page.getByRole('combobox', { name: 'Open saved app' }).locator('option')).toHaveCount(6);
  await page.getByLabel('Import App Lab backup', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"not":"a project"}') });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Open saved app' }).locator('option')).toHaveCount(6);
});

test('text code has line diagnostics and completions; drafts survive reload and apply to blocks', async ({ page }, info) => {
  await preview(page, 'Tap counter');
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await page.getByRole('button', { name: 'Show text', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'App JavaScript code', exact: true });
  await editor.fill('onStart(function() {\n console.log(;\n});');
  await expect(page.locator('.cm-lint-marker-error').first()).toBeVisible();
  await expect(page.getByLabel('Code warnings')).toContainText('Line 2');
  await expect(page.getByRole('button', { name: 'Run app', exact: true })).toBeDisabled();
  await page.screenshot({ path: `.impeccable/review/app-lab-errors-${info.project.name}.png`, fullPage: true });
  await page.reload();
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(editor).toContainText('console.log(;');
  await editor.fill('getT'); await editor.press('Control+Space');
  await expect(page.locator('.cm-tooltip-autocomplete')).toContainText('getText');
  await editor.press('Escape');
  await editor.fill('var score = 0;\nonEvent("count", "click", function() {\n score = score + 2;\n setText("total", score);\n});');
  await page.getByRole('button', { name: 'Apply code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Run app', exact: true })).toBeEnabled();
  await page.screenshot({ path: `.impeccable/review/app-lab-text-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Show blocks', exact: true }).click();
  await page.getByRole('button', { name: 'Edit set var command as text', exact: true }).first().click();
  await expect(page.getByRole('textbox', { name: 'Edit set var command' }).first()).toHaveValue('var score = 0;');
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Add one' }).click();
  await expect(page.locator('.al-runtime-label').filter({ hasText: /^2$/ })).toBeVisible();
});

test('commands insert into event bodies, edit arguments, undo and run', async ({ page }, info) => {
  await preview(page, 'Blank app');
  await page.getByRole('button', { name: 'Button', exact: true }).click();
  await page.getByRole('button', { name: 'Label', exact: true }).click();
  await page.getByRole('button', { name: 'Select button1, button', exact: true }).click();
  await page.getByRole('button', { name: 'Add event blocks', exact: true }).click();
  const eventBlock = page.locator('.al-js-block').filter({ has: page.getByRole('button', { name: 'Edit event command as text', exact: true }) }).last();
  const destination = eventBlock.locator('.al-code-gap').last();
  const command = page.getByRole('button', { name: 'setText("label1", "Hello!");', exact: true });
  if (info.project.name === 'desktop') await command.dragTo(destination);
  else { await destination.click(); await command.click(); }
  await page.getByRole('button', { name: 'Edit set text command as text', exact: true }).click();
  const line = page.getByRole('textbox', { name: 'Edit set text command', exact: true });
  await expect(line).toBeVisible();
  await line.fill('setText("label1", "Made with blocks");'); await line.blur();
  await page.getByRole('button', { name: 'Undo code change', exact: true }).click();
  await expect(line).toHaveValue('setText("label1", "Hello!");');
  await page.getByRole('button', { name: 'Redo code change', exact: true }).click();
  await expect(line).toHaveValue('setText("label1", "Made with blocks");');
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Tap me' }).click();
  await expect(page.locator('.al-runtime-label')).toHaveText('Made with blocks');
});

test('destructive edits use a cancel-safe confirmation', async ({ page }) => {
  await preview(page, 'Blank app');
  await page.getByRole('button', { name: 'Button', exact: true }).click();
  await page.getByRole('button', { name: 'Delete control', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete this control?' });
  await expect(dialog).toBeVisible(); await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Select button1, button' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete control', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete control', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select button1, button' })).toHaveCount(0);
});

test('student apps save to assigned account scope without touching public preview', async ({ page }) => {
  const identity = { learnerId: 'app-lab-synthetic-child', classroomId: 'app-lab-synthetic-class' };
  let saved: ProgressDocument | null = null, revision = 0;
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample class', assignments: [{ id: 'sample-assignment', courseKey: 'grade-4' }] } }));
  await page.route('**/api/student/progress/grade-4', route => {
    if (route.request().method() === 'POST') { const body = route.request().postDataJSON(); const result = progressDocument.safeParse(body.document); if (!result.success) return route.fulfill({ status: 400, json: { code: 'INVALID_PROGRESS' } }); saved = result.data; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, revision, updatedAt: null, document: saved } });
  });
  await page.addInitScript(() => localStorage.setItem('kodearcade-app-lab-v1:preview', 'public data must remain separate'));
  await page.goto('/#/student-courses'); await page.getByRole('link', { name: 'Open App Lab · Grade 4', exact: true }).click();
  await page.getByRole('button', { name: /^Tap counter/ }).click();
  await expect.poll(() => saved?.appLab?.projects[0].title).toBe('Tap counter');
  const skip = page.getByRole('link', { name: 'Skip to App Lab workspace', exact: true }); await skip.focus(); await skip.press('Enter');
  await expect(page).toHaveURL(/#\/student-play\/grade-4\/apps$/); await expect(page.locator('#app-lab-main')).toBeFocused();
  await page.getByRole('textbox', { name: 'App project name' }).fill('My private counter');
  await expect.poll(() => saved?.appLab?.projects[0].title).toBe('My private counter');
  expect(saved?.progress).toEqual({});
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-app-lab-v1:preview'))).toBe('public data must remain separate');
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-app-lab-v1:grade-4'))).toBeNull();
  await page.reload(); await expect(page.getByRole('textbox', { name: 'App project name' })).toHaveValue('My private counter');
  await page.goto('/#/student-play/grade-5/apps'); await expect(page.getByRole('heading', { name: 'This activity isn’t available' })).toBeVisible();
});

test('reference-style blocks stack, align all numbers in the gutter and save socket edits', async ({ page }, info) => {
  await preview(page, 'Tap counter');
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await page.getByRole('button', { name: 'Show text', exact: true }).click();
  await page.getByRole('textbox', { name: 'App JavaScript code', exact: true }).fill('onEvent("count", "click", function() {\n var score = 1;\n if (score > 0) {\n setText("total", score);\n }\n});');
  await page.getByRole('button', { name: 'Apply code', exact: true }).click();
  await page.getByRole('button', { name: 'Show blocks', exact: true }).click();
  const number = page.getByRole('textbox', { name: 'set var argument 2', exact: true });
  await expect(number).toHaveCSS('padding', '0px');
  await expect(number).toHaveCSS('border-top-width', '0px');
  await number.fill(''); await expect(number).toBeVisible();
  await number.fill('2'); await number.blur();
  const geometry = await page.locator('.al-program-sheet').evaluate(sheet => {
    const numbers = [...sheet.querySelectorAll('.al-block-line')].map(n => n.getBoundingClientRect());
    const gutter = sheet.querySelector('.al-number-gutter')!.getBoundingClientRect();
    const body = sheet.querySelector('.al-js-body')!;
    const entries = [...body.querySelector(':scope > .al-js-list')!.querySelectorAll(':scope > .al-js-entry > .al-js-block')].map(n => n.getBoundingClientRect());
    return { aligned: Math.max(...numbers.map(n => n.right)) - Math.min(...numbers.map(n => n.right)),
      inGutter: numbers.every(n => n.left >= gutter.left && n.right <= gutter.right),
      seam: entries[1].top - entries[0].bottom, lines: numbers.map(n => Math.round(n.right)) };
  });
  expect(geometry.aligned).toBeLessThan(1); expect(geometry.inGutter).toBe(true); expect(geometry.seam).toBe(6);
  await expect(page.locator('.al-js-program')).toContainText('make variable');
  await expect(page.getByLabel('Live JavaScript preview', { exact: true })).toHaveCount(0);
  await expect(page.locator('.al-js-block').first()).toHaveCSS('border-left-width', '4px');
  await expect(page.locator('.al-js-block').first()).toHaveCSS('border-radius', '11px');
  await page.locator('.al-js-program').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.impeccable/review/app-lab-claude-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.al-code').analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Run app', exact: true }).click();
  await page.locator('.al-preview').getByRole('button', { name: 'Add one' }).click();
  await expect(page.locator('.al-runtime-label').filter({ hasText: /^2$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Stop app', exact: true }).click();
  await page.getByRole('textbox', { name: 'event argument 1', exact: true }).fill('missingButton');
  await page.getByRole('textbox', { name: 'event argument 1', exact: true }).blur();
  await expect(page.locator('.al-gutter-warning, .al-gutter-error').first()).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'event argument 1', exact: true })).toHaveValue('missingButton');
  await expect(page.getByRole('textbox', { name: 'set var argument 2', exact: true })).toHaveValue('2');
});
