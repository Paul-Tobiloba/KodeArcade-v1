import { test, expect } from '@playwright/test';

test('prefers a female local voice and remembers a manually chosen child voice', async ({ page }, info) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__voiceCalls', { value: calls });
    const voices = [{ name: 'David', voiceURI: 'david' }, { name: 'Microsoft Zira', voiceURI: 'zira' }, { name: 'Story voice', voiceURI: 'child' }].map(v => ({ ...v, lang: 'en-US', localService: true }));
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { text: string; constructor(text: string) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => voices, speak: (u: { voice: { name: string }, onend?: () => void }) => { calls.push(u.voice.name); setTimeout(() => u.onend?.(), 25); }, cancel: () => {}, addEventListener: () => {}, removeEventListener: () => {} } });
  });
  await page.goto('/#/learn/grade-1');
  await page.getByRole('button', { name: 'Listen to lesson' }).click();
  expect(await page.evaluate(() => (window as unknown as { __voiceCalls: string[] }).__voiceCalls.at(-1))).toBe('Microsoft Zira');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('combobox', { name: 'Voice', exact: true }).selectOption('child');
  await page.getByRole('button', { name: 'Preview voice', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { __voiceCalls: string[] }).__voiceCalls.at(-1))).toBe('Story voice');
  await page.waitForTimeout(50);
  await page.screenshot({ path: `.impeccable/review/grades-${info.project.name}-voice-settings.png`, fullPage: true });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Listen to lesson' }).click();
  expect(await page.evaluate(() => (window as unknown as { __voiceCalls: string[] }).__voiceCalls.at(-1))).toBe('Story voice');
});
