import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { if (!localStorage.getItem('kodearcade-v1')) localStorage.setItem('kodearcade-v1', JSON.stringify({ version: 1, course: 'words', current: 0, progress: {} })); }); });

test('sound cues follow runs and mute persists', async ({ page }) => {
  await page.addInitScript(() => {
    const audioWindow = window as typeof window & { playedNotes: number[] };
    audioWindow.playedNotes = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const voice = create.call(this);
      const start = voice.start.bind(voice);
      voice.start = (when?: number) => { audioWindow.playedNotes.push(voice.frequency.value); start(when); };
      return voice;
    };
  });
  const notes = () => page.evaluate(() => (window as typeof window & { playedNotes: number[] }).playedNotes.length);
  await page.goto('/#/learn/words');
  expect(await notes()).toBe(0);
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect.poll(notes).toBe(3);
  await page.getByRole('button', { name: 'Dismiss retry message', exact: true }).click();
  await page.getByText('Keyboard helpers', { exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Add block', exact: true }).click();
  await expect(page.getByText('3 / 24 blocks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('Byte is recharged.', { exact: false })).toBeVisible();
  await expect.poll(notes).toBe(11); // Retry's 3 notes, 3 steps, then 5 star chimes.
  await page.getByRole('button', { name: 'Close feedback', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Byte sound effects').uncheck();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Byte sound effects')).not.toBeChecked();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('Byte is recharged.', { exact: false })).toBeVisible();
  expect(await notes()).toBe(0);
});
