import { test, expect } from '@playwright/test';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';
import { emptySave } from '../src/storage';

const cast = [
  ['Byte','sequences','byte-bounce'], ['Dash','directions','rabbit-hop'],
  ['Gigi','loops','gecko-scamper'], ['Fix','debugging','fox-trot'],
  ['Milo','conditionals','monkey-hop'], ['Nova','variables','squirrel-dash'],
] as const;

async function seed(page: import('@playwright/test').Page, topic = 'sequences', reduced = false) {
  const id = `grade-3-${topic}-1`, save = emptySave();
  save.course = 'grade-3'; save.current = missions.findIndex(m => m.id === id);
  save.reducedMotion = reduced; save.soundEnabled = !reduced;
  save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: gradeSolutions[id] } }] } } };
  await page.addInitScript(save => {
    localStorage.setItem('kodearcade-v1',JSON.stringify(save));
    const state = window as typeof window & { notes: string[] }; state.notes = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const voice = create.call(this), start = voice.start.bind(voice);
      voice.start = when => { state.notes.push(voice.type); start(when); }; return voice;
    };
  }, save);
  await page.goto('/#/learn/grade-3');
  await expect(page.locator('.tile-scene')).toBeVisible();
}

for (const [name, topic, motion] of cast) test(`${name} moves with personality and celebrates before feedback`, async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await seed(page, topic);
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-character',name);
  expect(await page.evaluate(() => (window as typeof window & { notes: string[] }).notes)).toEqual([]);
  const selectors = ['.tile-map','.editor'];
  const boxes = await Promise.all(selectors.map(s => page.locator(s).boundingBox()));
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.character-motion.is-stepping')).toHaveCSS('animation-name', motion);
  await expect(page.locator('.character-ground-shadow')).toHaveCSS('animation-name','step-shadow');
  await expect(page.locator('.step-dust')).toHaveCount(1);
  if (name === 'Byte' || name === 'Milo') await page.locator('.tile-scene').screenshot({ path: `.impeccable/review/motion-${name.toLowerCase()}-moving-${info.project.name}.png` });
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-state','success',{timeout:15000});
  await expect(page.getByRole('dialog', { name: 'You made it!' })).not.toBeVisible();
  await expect(page.locator('.destination-sprite')).toHaveCSS('animation-name','destination-light');
  await expect(page.locator('.goal-celebration svg')).toHaveCount(4);
  if (name === 'Byte' || name === 'Milo') await page.locator('.tile-scene').screenshot({ path: `.impeccable/review/motion-${name.toLowerCase()}-arrival-${info.project.name}.png` });
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(5);
  await page.getByRole('button', { name: 'Close feedback' }).click();
  const notes = await page.evaluate(() => (window as typeof window & { notes: string[] }).notes);
  expect(notes.length).toBeGreaterThan(9);
  if (name === 'Milo') expect(notes).toContain('sawtooth');
  for (let i=0;i<selectors.length;i++) {
    const after = await page.locator(selectors[i]).boundingBox();
    for (const key of ['x','y','width','height'] as const) expect(after![key]).toBeCloseTo(boxes[i]![key],1);
  }
  await page.getByRole('button', { name: 'Reset position' }).click();
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-state','ready');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.character-motion.is-stepping')).toHaveCSS('animation-name',motion);
  await page.getByRole('button', { name: 'Stop run' }).click();
  await expect(page.locator('.character-motion.is-stepping')).toHaveCount(0);
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-state','ready');
  expect(errors).toEqual([]);
});

for (const system of [false,true]) test(`reduced motion and mute preserve success (${system ? 'device' : 'saved preference'})`, async ({ page }) => {
  if (system) await page.emulateMedia({reducedMotion:'reduce'});
  await seed(page,'sequences',true);
  if (system) {
    await page.getByRole('button', { name: 'Settings', exact:true }).click();
    await page.getByLabel('Show steps without sliding animations').uncheck();
    await page.getByRole('button', { name: 'Done', exact:true }).click();
  }
  await page.getByRole('button', { name: 'Run code', exact:true }).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.character-motion.is-stepping')).toHaveCSS('animation-name','none');
  await expect(page.locator('.robot-position')).toHaveCSS('transition-duration','0s');
  await expect(page.getByRole('dialog', { name:'You made it!' })).toBeVisible({timeout:15000});
  await expect(page.locator('.celebration-confetti')).toHaveCount(0);
  await page.getByRole('button', { name:'Close feedback' }).click();
  await expect(page.locator('.world-toolbar')).toContainText('Recharged!');
  expect(await page.evaluate(() => (window as typeof window & { notes:string[] }).notes)).toEqual([]);
});

test('stage motion pauses outside the viewport and resumes on return', async ({ page },info) => {
  test.skip(info.project.name === 'desktop','Desktop keeps all three columns in view.');
  await seed(page,'loops');
  await page.getByRole('button',{name:'Run code',exact:true}).click();
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-motion-paused','false');
  // The editor is shorter than some viewports, so scrolling to it alone can
  // leave part of the stage visible. Add a test-only tail to move it fully out.
  await page.evaluate(() => {
    const tail = document.createElement('div'); tail.style.height = '100vh';
    document.querySelector('.course-main')!.append(tail);
    window.scrollTo(0,document.documentElement.scrollHeight);
  });
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-motion-paused','true');
  await expect(page.locator('.character-ground-shadow')).toHaveCSS('animation-play-state','paused');
  await page.locator('.tile-scene').scrollIntoViewIfNeeded();
  await expect(page.locator('.tile-scene')).toHaveAttribute('data-motion-paused','false');
});

test('animated K loading screen uses the actual logo and clears when ready', async ({ page },info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/src/App.tsx*',async route => { await gate; await route.continue(); });
  try {
    await page.goto('/#/learn/grade-2',{waitUntil:'domcontentloaded'});
    await expect(page.getByRole('status',{name:'Loading KodeArcade'})).toBeVisible();
    await expect(page.locator('.brand-loader img')).toHaveJSProperty('complete',true);
    const svg = await (await page.request.get('/brand/mark-loading.svg')).text();
    expect(svg.match(/<path /g)).toHaveLength(3);
    expect(svg).toContain('prefers-reduced-motion'); expect(svg).toContain('@keyframes assemble');
    await page.screenshot({path:`.impeccable/review/k-loading-${info.project.name}.png`});
  } finally { release(); }
  await expect(page.getByRole('button',{name:'Start challenge',exact:true})).toBeVisible();
  await expect(page.locator('.brand-loader')).toHaveCount(0);
});
