import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { typingActivity } from '../shared/typingCurriculum';
import { emptyTyping, typingStorageKey } from '../shared/typing';
import type { ProgressDocument } from '../shared/progress';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/session', r => r.fulfill({ json:null }));
  await page.route('**/api/capabilities', r => r.fulfill({ json:{} }));
});
async function open(page: Page, id: string) { await page.goto(`/#/typing/grade-${typingActivity(id)!.grade}/${id}`); await expect(page.locator('#typing-entry')).toBeVisible(); }
async function complete(page: Page, id: string) { const a = typingActivity(id)!; for (const target of a.rounds.length ? a.rounds : [a.target]) {if(a.kind==='edit')await page.locator('#typing-entry').fill(target);else await page.locator('#typing-entry').pressSequentially(target);} await expect(page.locator('.typing-result')).toBeVisible(); }
test('course chooser and marketing catalogue expose all six typing courses separately', async ({ page }, info) => {
  await page.goto('/#/learn'); await page.getByRole('button',{name:'Typing',exact:true}).click();
  await expect(page.locator('.typing-course-link')).toHaveCount(6);
  await page.locator('.typing-course-link').first().click(); await expect(page.getByText('0 of 120 activities complete',{exact:true})).toBeVisible();
  await expect(page.locator('.typing-unit')).toHaveCount(10); await expect(page.locator('.typing-activity-card')).toHaveCount(120);
  await page.screenshot({path:`.impeccable/review/typing-map-${info.project.name}.png`,fullPage:true});
  await page.goto('/#/courses'); await expect(page.getByRole('heading',{name:'Typing courses',exact:true})).toBeVisible(); await expect(page.locator('.typing-course-link')).toHaveCount(6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('physical typing, key guidance, pause and retry preserve earned stars', async ({ page }, info) => {
  const id='typing-g1-u01-a01', target=typingActivity(id)!.target;
  await open(page,id);
  await expect(page.locator('[data-key="f"].next')).toBeVisible();await expect(page.locator('.typing-guide-label')).toContainText('Left index finger');
  await expect(page.locator('.typing-articulated-hands,[data-hand-finger]')).toHaveCount(0);
  await page.screenshot({path:`.impeccable/review/typing-lesson-${info.project.name}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).include('.typing-app').analyze()).violations).toEqual([]);
  const input=page.locator('#typing-entry');await input.pressSequentially('f');await expect(page.locator('[data-key="Space"].next')).toBeVisible();await expect(page.locator('[data-hand-finger]')).toHaveCount(0);
  await page.getByRole('button',{name:'Pause',exact:true}).click(); await expect(page.getByRole('heading',{name:'Take a breath'})).toBeVisible();
  await page.getByRole('button',{name:'Continue practice'}).click(); await expect(input.locator('.typing-character.correct')).toHaveCount(1);await input.pressSequentially(target.slice(1));
  await expect(page.getByRole('img',{name:'You earned 5 of 5 stars'})).toBeVisible();
  await page.locator('.typing-stars').evaluate(group=>{ for(const animation of group.getAnimations({subtree:true})) { animation.pause(); animation.currentTime=1050; } });
  await page.screenshot({path:`.impeccable/review/typing-motion-${info.project.name}.png`,fullPage:true});
  await page.locator('.typing-stars').evaluate(group=>{ for(const animation of group.getAnimations({subtree:true})) animation.play(); });
  await page.locator('.typing-result').evaluate(async e=>{await Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished));});
  await page.screenshot({path:`.impeccable/review/typing-result-${info.project.name}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).include('.typing-result').analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Practise again'}).click();await input.pressSequentially('x');await input.press('Backspace');await input.pressSequentially(target);
  await expect(page.getByText('Best saved for this activity: 5 / 5 stars',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByText('Best saved for this activity: 5 / 5 stars',{exact:true})).not.toBeVisible();
  expect(await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).results[id].bestStars,{key:typingStorageKey('grade-1'),id})).toBe(5);
});
test('games, stories, repair and writing use their own completion rules', async ({ page }) => {
  for(const id of ['typing-g3-u01-a07','typing-g3-u01-a08','typing-g3-u01-a09']) { await open(page,id);await complete(page,id); }
  const id='typing-g3-u10-a12';await open(page,id);const text='My little garden has green plants and bright flowers.';
  await page.getByLabel('Your writing',{exact:true}).fill('a b');await expect(page.getByRole('button',{name:'Finish writing'})).toBeDisabled();
  await page.getByLabel('Your writing',{exact:true}).fill(text);await page.getByRole('button',{name:'Finish writing'}).click();await expect(page.locator('.typing-result')).toBeVisible();
  expect(await page.evaluate(text=>localStorage.getItem('kodearcade-typing-v1:grade-3')!.includes(text),text)).toBe(false);
  await expect(page.getByText('First-try accuracy',{exact:true})).toHaveCount(0);await expect(page.getByText('Words per minute',{exact:true})).toHaveCount(0);
});
test('independent checks record support honestly and respect reduced motion', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const id='typing-g2-u01-a11';await open(page,id);
  await expect(page.getByRole('button',{name:'Guide off'})).toBeVisible();await page.getByRole('button',{name:'Guide off'}).click();await complete(page,id);
  const result=await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).results[id],{key:typingStorageKey('grade-2'),id});expect(result.independent).toBe(false);
  await expect(page.locator('.typing-stars .earned img').first()).toHaveCSS('animation-name','none');
  await page.getByRole('button',{name:'Practise again'}).click();await complete(page,id);
  expect(await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).results[id].independent,{key:typingStorageKey('grade-2'),id})).toBe(true);
});
test('student typing saves to the assigned account, never the public preview', async ({page})=>{
  const identity={learnerId:'synthetic-typist',classroomId:'synthetic-class'};
  let document:ProgressDocument={version:1,currentId:'grade-2-sequences-1',view:'challenge',progress:{},drawings:{},preferences:{reducedMotion:true,largeText:false,soundEnabled:false,musicEnabled:false},basicsComplete:[],topicRecords:{}};
  await page.addInitScript(value=>localStorage.setItem('kodearcade-typing-v1:grade-2',JSON.stringify(value)),emptyTyping(2));
  await page.route('**/api/student/courses',r=>r.fulfill({json:{...identity,displayName:'Sample Typist',classroomName:'Sample class',assignments:[{id:'sample-assignment',courseKey:'grade-2'}]}}));
  await page.route('**/api/student/progress/grade-2',r=>{if(r.request().method()==='POST'){document=r.request().postDataJSON().document;return r.fulfill({json:{revision:2}});}return r.fulfill({json:{...identity,revision:1,document,updatedAt:null}});});
  await page.goto('/#/student-courses');await page.getByRole('link',{name:/Grade 2 · Typing/}).click();await page.getByRole('button',{name:'Start typing',exact:true}).click();
  await page.locator('#typing-entry').pressSequentially(typingActivity('typing-g2-u01-a01')!.target);
  await expect.poll(()=>Object.keys(document.typing?.results??{}).length).toBe(1);
  expect(document.progress).toEqual({});expect(document.typing!.results['typing-g2-u01-a01'].bestStars).toBe(5);
  expect(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('kodearcade-typing-v1:grade-2')!).results).length)).toBe(0);
  await page.goto('/#/student-play/grade-6/typing');await expect(page.getByRole('heading',{name:'This activity isn’t available'})).toBeVisible();
});
test('corrupt typing progress is not silently replaced',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('kodearcade-typing-v1:grade-1','{broken'));
  await page.goto('/#/typing/grade-1');await expect(page.getByRole('alert')).toContainText('original has not been replaced');await expect(page.locator('#typing-entry')).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('kodearcade-typing-v1:grade-1'))).toBe('{broken');
});
test('writing can be downloaded and visible navigation protects an unfinished draft', async({page})=>{
  await open(page,'typing-g4-u01-a12');await page.getByLabel('Your writing',{exact:true}).fill('A small fictional garden is quiet.');
  await page.getByRole('button',{name:'Back to lesson',exact:true}).click();await expect(page.getByRole('dialog',{name:'Leave this writing?'})).toBeVisible();
  await page.getByRole('button',{name:'Keep writing',exact:true}).click();await expect(page.getByLabel('Your writing',{exact:true})).toHaveValue('A small fictional garden is quiet.');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download writing',exact:true}).click();expect((await download).suggestedFilename()).toBe('my-typing-grade-4.txt');
  await page.getByRole('button',{name:'Try again',exact:true}).click();await page.getByRole('button',{name:'Leave writing',exact:true}).click();await expect(page.getByLabel('Your writing',{exact:true})).toHaveValue('');
});
test('lesson is keyboard accessible and fits a short desktop without horizontal overflow',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1306,height:656});
  await open(page,'typing-g2-u01-a02');
  await page.screenshot({path:`.impeccable/review/typing-short-${info.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(info.project.name==='desktop')expect((await page.locator('.typing-practice-footer').boundingBox())!.y+(await page.locator('.typing-practice-footer').boundingBox())!.height).toBeLessThanOrEqual(656);
  await page.locator('#typing-entry').focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Try again'})).toBeFocused();
});
