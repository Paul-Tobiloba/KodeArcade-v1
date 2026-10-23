import {test,expect} from '@playwright/test';
import {typingActivity} from '../shared/typingCurriculum';
import type {ProgressDocument} from '../shared/progress';

test.beforeEach(async({page})=>{await page.route('**/api/session',r=>r.fulfill({json:null}));await page.route('**/api/capabilities',r=>r.fulfill({json:{}}));});
test('mixed error recovery fits desktops with a static Byte illustration',async({page},info)=>{
  test.skip(info.project.name!=='desktop','Desktop height regression');
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'no-preference'});
  for(const [width,height] of [[1672,941],[1306,656]]){
    await page.setViewportSize({width,height});await page.goto('/#/typing/grade-1/typing-g1-u04-a01');await page.locator('#typing-entry').waitFor();await page.getByRole('button',{name:'Try again',exact:true}).click();await page.evaluate(()=>document.fonts.ready);
    const input=page.locator('#typing-entry');await input.pressSequentially('q x');await input.press('Backspace');await input.pressSequentially('w x');
    for(const state of ['correct','incorrect','corrected','current'])await expect(page.locator(`.typing-conveyor-line.active .typing-character.${state}`).first()).toBeVisible();
    await expect(page.locator('.typing-feedback')).toContainText('Use Backspace');
    const box=(await page.locator('.typing-practice-footer').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(height);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  const mascot=page.locator('img.byte-typing');await expect(mascot).toHaveCSS('animation-name','none');expect(await mascot.evaluate(element=>element.getAnimations().length)).toBe(0);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(mascot).toHaveCSS('animation-name','none');await page.getByRole('button',{name:'Resume',exact:true}).click();await expect(mascot).toHaveCSS('animation-name','none');
  await page.getByLabel('Typing settings',{exact:true}).click();await page.getByLabel('Reduce motion',{exact:true}).check();await expect(mascot).toHaveCSS('animation-name','none');await page.getByLabel('Reduce motion',{exact:true}).uncheck();await page.getByLabel('Typing settings',{exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});await expect(mascot).toHaveCSS('animation-name','none');
});
test('Claude activity has the platform header and stays light through practice, result and map',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1311,height:685});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  const id='typing-g1-u01-a01';await page.goto(`/#/typing/grade-1/${id}`);await page.evaluate(()=>document.fonts.ready);
  const header=page.locator('.platform-header');await expect(header).toHaveCSS('background-color','rgb(36, 18, 89)');await expect(page.locator('.landing-nav')).toHaveCount(0);await expect(page.locator('.typing-app')).toHaveCSS('color-scheme','light');await expect(header.getByRole('link',{name:'Log in',exact:true})).toBeVisible();
  await expect(page.locator('.typing-lesson-hero')).toBeVisible();await expect(page.locator('.typing-finger-panel')).toHaveCount(2);await expect(page.locator('.typing-articulated-hands,.typing-hand-overlay,[data-hand-finger]')).toHaveCount(0);
  const mascot=page.locator('img.byte-typing');await expect(mascot).toHaveAttribute('src','/images/typing/byte-typing.png');await expect(mascot).toHaveJSProperty('complete',true);expect(await mascot.evaluate(element=>(element as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(420);await expect(mascot).toHaveCSS('animation-name','none');
  const scenery=await page.locator('.typing-lesson-hero').evaluate(element=>{const box=element.getBoundingClientRect(),style=getComputedStyle(element,'::before');return {left:box.left+parseFloat(style.left),right:box.right-parseFloat(style.right),viewport:innerWidth};});expect(scenery.left).toBeGreaterThanOrEqual(0);expect(scenery.right).toBeLessThanOrEqual(scenery.viewport);
  await expect(page.locator('.typing-finger-panel.left .finger-3')).toHaveAttribute('aria-current','true');
  await page.locator('#typing-entry').focus();await page.screenshot({path:`.impeccable/review/typing-claude-practice-${info.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(info.project.name==='desktop'){const box=(await page.locator('.typing-practice-footer').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(685);}
  await page.locator('#typing-entry').pressSequentially(typingActivity(id)!.target);await expect(page.locator('.typing-result')).toBeVisible();await expect(header).toBeVisible();await page.screenshot({path:`.impeccable/review/typing-claude-result-${info.project.name}.png`,fullPage:true});if(info.project.name==='desktop'){const box=(await page.locator('.typing-result').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(685);}
  await page.getByRole('button',{name:'Lesson map',exact:true}).click();await expect(page.locator('.typing-unit')).toHaveCount(10);await expect(header).toBeVisible();await page.screenshot({path:`.impeccable/review/typing-claude-map-${info.project.name}.png`,fullPage:true});
});
for(const kind of ['adult','learner'] as const)test(`signed-in ${kind} preview retains real navigation without claiming cloud saves`,async({page},info)=>{
  const now=Date.now();
  await page.route('**/api/session',r=>r.fulfill({json:{user:{id:`sample-${kind}`,name:kind==='adult'?'Sample Adult':'Sample Learner',principalKind:kind},sessionKey:'synthetic',lastActiveAt:now,expiresAt:now+3600000}}));await page.route('**/api/session/activity',r=>r.fulfill({json:{active:true}}));
  await page.goto('/#/typing/grade-1/typing-g1-u01-a01');await page.evaluate(()=>document.fonts.ready);const header=page.locator('.platform-header');await expect(header.getByRole('link',{name:'Log in',exact:true})).toHaveCount(0);await expect(header.getByRole('link',{name:kind==='adult'?'My dashboard':'My courses',exact:true})).toHaveAttribute('href',kind==='adult'?'/#/dashboard':'/#/student-courses');await expect(page.locator('.student-cloud-status')).toHaveCount(0);await expect(page.getByText('Progress saves to your student account.',{exact:true})).toHaveCount(0);await page.screenshot({path:`.impeccable/review/typing-claude-preview-${kind}-${info.project.name}.png`,fullPage:true});
  await page.goto('/#/learn?subject=typing');await expect(page.locator('.platform-header')).toBeVisible();await expect(page.getByRole('link',{name:kind==='adult'?'My dashboard':'My courses',exact:true})).toBeVisible();
});
test('assigned typing retains its learner menu, private saves and account settings',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1306,height:656});
  const identity={learnerId:'synthetic-typist',classroomId:'synthetic-class'},now=Date.now();let document:ProgressDocument={version:1,currentId:'grade-2-sequences-1',view:'challenge',progress:{},drawings:{},preferences:{reducedMotion:true,largeText:false,soundEnabled:false,musicEnabled:false},basicsComplete:[],topicRecords:{}};
  await page.route('**/api/session',r=>r.fulfill({json:{user:{id:identity.learnerId,name:'Sample Typist',principalKind:'learner'},sessionKey:'synthetic',lastActiveAt:now,expiresAt:now+3600000}}));
  await page.route('**/api/student/courses',r=>r.fulfill({json:{...identity,displayName:'Sample Typist',classroomName:'Sample class',assignments:[{id:'sample',courseKey:'grade-2'}]}}));
  await page.route('**/api/student/progress/grade-2',r=>{if(r.request().method()==='POST'){document=r.request().postDataJSON().document;return r.fulfill({json:{revision:2}});}return r.fulfill({json:{...identity,revision:1,document,updatedAt:null}});});
  await page.goto('/#/student-play/grade-2/typing/typing-g2-u01-a01');await expect(page.locator('#typing-entry')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#typing-entry')).toBeFocused();
  await page.getByLabel('Open account options',{exact:true}).click();await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();await expect(page.getByText('Sample Typist',{exact:true})).toBeVisible();await page.screenshot({path:`.impeccable/review/typing-claude-private-menu-${info.project.name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByLabel('Larger practice text',{exact:true})).toBeVisible();await page.getByLabel('Typing settings',{exact:true}).click();
  await page.locator('#typing-entry').pressSequentially(typingActivity('typing-g2-u01-a01')!.target);await expect(page.locator('.typing-result')).toBeVisible();await expect.poll(()=>document.typing?.results['typing-g2-u01-a01']?.bestStars).toBe(5);expect(document.progress).toEqual({});expect(await page.evaluate(()=>localStorage.getItem('kodearcade-typing-v1:grade-2'))).toBeNull();
});
