import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/session',r=>r.fulfill({json:null}));await page.route('**/api/capabilities',r=>r.fulfill({json:{}}));});
test('hands are absent while next-key labels, highlights and sound remain',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1311,height:685});
  await page.addInitScript(()=>{const Native=AudioContext;window.AudioContext=class extends Native{createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source);source.start=((...args:Parameters<AudioBufferSourceNode['start']>)=>{window.dispatchEvent(new Event('typing-click-played'));return start(...args);}) as AudioBufferSourceNode['start'];return source;}};});
  await page.goto('/#/typing/grade-1/typing-g1-u04-a01');const input=page.getByRole('textbox',{name:'Type the practice passage',exact:true});
  await expect(page.locator('.typing-articulated-hands,.typing-hand-overlay,[data-hand-finger]')).toHaveCount(0);await expect(page.locator('[data-key="q"].next')).toBeVisible();await expect(page.locator('.typing-guide-label')).toContainText('Left little finger');
  await page.getByLabel('Typing settings',{exact:true}).click();await expect(page.getByLabel('Transparent hands',{exact:true})).toHaveCount(0);await page.getByLabel('Typing settings',{exact:true}).click();
  await page.evaluate(()=>{(window as unknown as {clicks:number}).clicks=0;addEventListener('typing-click-played',()=>{(window as unknown as {clicks:number}).clicks++;});});
  await input.pressSequentially('q');await expect.poll(()=>page.evaluate(()=>(window as unknown as {clicks:number}).clicks)).toBe(1);await expect(page.locator('[data-key="Space"].next')).toBeVisible();
  await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);});await page.waitForTimeout(220);await page.screenshot({path:`.impeccable/review/typing-simple-space-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Mute keyboard sound',exact:true}).click();await input.pressSequentially(' w ');expect(await page.evaluate(()=>(window as unknown as {clicks:number}).clicks)).toBe(1);await expect(page.locator('[data-key="e"].next')).toBeVisible();await expect(page.locator('.typing-guide-label')).toContainText('Left middle finger');
  await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);});await page.waitForTimeout(220);await page.screenshot({path:`.impeccable/review/typing-no-hands-${info.project.name}.png`,fullPage:true});
  const footer=(await page.locator('.typing-practice-footer').boundingBox())!;if(info.project.name==='desktop')expect(footer.y+footer.height).toBeLessThanOrEqual(685);
});
test('simple senior scene preserves corrections and opposite Shift at laptop size',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1306,height:656});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/typing/grade-6/typing-g6-u04-a06');const input=page.getByRole('textbox',{name:'Type the practice passage',exact:true});await expect(page.locator('[data-key="ShiftLeft"].next')).toBeVisible();await expect(page.locator('[data-key="o"].next')).toBeVisible();
  await input.pressSequentially('x');await input.press('Backspace');await input.pressSequentially('Our group ');await expect(page.locator('[data-position="0"]')).toHaveClass(/corrected/);await expect(page.locator('.typing-articulated-hands')).toHaveCount(0);
  await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);});await page.screenshot({path:`.impeccable/review/typing-simple-senior-${info.project.name}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(info.project.name==='desktop'){const footer=(await page.locator('.typing-practice-footer').boundingBox())!;expect(footer.y+footer.height).toBeLessThanOrEqual(656);}
});
