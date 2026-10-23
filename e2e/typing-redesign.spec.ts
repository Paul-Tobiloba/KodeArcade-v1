import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {typingActivity} from '../shared/typingCurriculum';

test.beforeEach(async({page})=>{await page.route('**/api/session',r=>r.fulfill({json:null}));await page.route('**/api/capabilities',r=>r.fulfill({json:{}}));});

test('senior passage types in place, retains corrections and advances the active line',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const id='typing-g6-u04-a06',target=typingActivity(id)!.target;
  await page.goto(`/#/typing/grade-6/${id}`);const passage=page.getByRole('textbox',{name:'Type the practice passage',exact:true});await expect(passage).toBeVisible();await expect(page.locator('textarea')).toHaveCount(0);
  await passage.pressSequentially(target.slice(0,2));await passage.pressSequentially(target[2]==='x'?'z':'x');await expect(page.locator('.typing-character[data-position="2"]')).toHaveClass(/incorrect/);
  await passage.press('Backspace');await passage.pressSequentially(target[2]);await expect(page.locator('.typing-character[data-position="2"]')).toHaveClass(/corrected/);
  await expect(page.locator('.typing-live-stats')).toContainText('75%');await expect(page.locator('.typing-live-stats')).toContainText('Streak 1');
  await expect(page.locator('.typing-byte,.typing-metric')).toHaveCount(0);
  const boundary=Number(await passage.locator('.typing-conveyor-line.active .typing-character').last().getAttribute('data-position'))+1;
  await passage.pressSequentially(target.slice(3,boundary));await expect(passage.locator('.typing-conveyor-line.active .typing-character').first()).toHaveAttribute('data-position',String(boundary));
  await expect(passage.locator('.typing-character[data-position="2"]')).toHaveClass(/corrected/);
  await expect(page.locator('.typing-conveyor-track')).toHaveCSS('transition-duration','0s');
  await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(passage).toHaveCount(0);await page.getByRole('button',{name:'Continue practice',exact:true}).click();await expect(passage).toBeFocused();
  await passage.press('Tab');await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeFocused();await passage.focus();
  expect((await new AxeBuilder({page}).include('.typing-app').analyze()).violations).toEqual([]);
  await page.evaluate(async()=>{await document.fonts.ready;scrollTo(0,0);});await page.screenshot({path:`.impeccable/review/typing-redesign-senior-${info.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await passage.pressSequentially(target.slice(boundary));await expect(page.locator('.typing-result')).toBeVisible();expect(errors).toEqual([]);
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('kodearcade-typing-v1:grade-6')!).results[id],id);expect(saved.latestAccuracy).toBeLessThan(100);expect(saved.complete).toBe(true);
});

test('focus-scoped input leaves navigation and settings keys alone',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1306,height:656});
  await page.goto('/#/typing/grade-1/typing-g1-u01-a01');const passage=page.getByRole('textbox',{name:'Type the practice passage',exact:true});await passage.pressSequentially('x');await passage.press('Backspace');await passage.pressSequentially('f');await expect(passage.locator('[data-position="0"]')).toHaveClass(/corrected/);
  await page.getByRole('button',{name:'Guide on',exact:true}).focus();await page.keyboard.press('a');await expect(passage.locator('.typing-character.current')).toHaveAttribute('data-position','1');
  await page.getByRole('button',{name:'Guide on',exact:true}).click();await expect(page.getByText('Guide off · turn it on whenever you need.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Guide off',exact:true}).click();await expect(page.locator('[data-key="Space"].next')).toBeVisible();
  await page.evaluate(async()=>{await document.fonts.ready;(document.activeElement as HTMLElement)?.blur();scrollTo(0,0);});await page.screenshot({path:`.impeccable/review/typing-redesign-short-${info.project.name}.png`,fullPage:true});
  if(info.project.name==='desktop'){const box=(await page.locator('.typing-practice-footer').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(656);}
});

test('default conveyor uses bounded motion and a pasted check remains supported',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});const id='typing-g6-u01-a11',target=typingActivity(id)!.target;
  await page.goto(`/#/typing/grade-6/${id}`);const passage=page.getByRole('textbox',{name:'Type the practice passage',exact:true});await expect(page.locator('.typing-conveyor-track')).toHaveCSS('transition-duration','0.28s');
  await passage.evaluate((element,text)=>{const data=new DataTransfer();data.setData('text/plain',text);element.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));},target);await expect(page.locator('.typing-result')).toBeVisible();
  expect(await page.evaluate(id=>JSON.parse(localStorage.getItem('kodearcade-typing-v1:grade-6')!).results[id].independent,id)).toBe(false);
});

test('senior passage and larger type fit the short desktop without clipped active text',async({page},info)=>{
  if(info.project.name==='desktop')await page.setViewportSize({width:1306,height:656});
  await page.goto('/#/typing/grade-6/typing-g6-u04-a06');
  const passage=page.getByRole('textbox',{name:'Type the practice passage',exact:true});await passage.focus();
  await page.getByLabel('Typing settings',{exact:true}).click();await page.getByLabel('Larger practice text',{exact:true}).check();await page.getByLabel('Typing settings',{exact:true}).click();
  const active=passage.locator('.typing-conveyor-line.active');await expect.poll(async()=>active.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.evaluate(async()=>{await document.fonts.ready;(document.activeElement as HTMLElement)?.blur();scrollTo(0,0);});await page.screenshot({path:`.impeccable/review/typing-redesign-large-${info.project.name}.png`,fullPage:true});
  if(info.project.name==='desktop'){const box=(await page.locator('.typing-practice-footer').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(656);}
});
