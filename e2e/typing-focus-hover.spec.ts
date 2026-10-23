import {test,expect} from '@playwright/test';
import {typingActivity} from '../shared/typingCurriculum';

test.beforeEach(async({page})=>{
  await page.route('**/api/session',r=>r.fulfill({json:null}));
  await page.route('**/api/capabilities',r=>r.fulfill({json:{}}));
});

test('typing is immediately ready on arrival, retry, next, map entry and resume',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const id='typing-g1-u01-a01';await page.goto(`/#/typing/grade-1/${id}`);
  const entry=page.locator('#typing-entry');await expect(entry).toBeFocused();
  await page.keyboard.type(typingActivity(id)!.target);await expect(page.locator('.typing-result')).toBeVisible();
  const next=page.getByRole('button',{name:'Next activity',exact:true});await next.hover();
  await expect(next).toHaveCSS('background-color','rgb(83, 50, 214)');await expect(next).toHaveCSS('color','rgb(255, 255, 255)');
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`.impeccable/review/typing-hover-result-${info.project.name}.png`,fullPage:true});
  await next.click();await expect(entry).toBeFocused();
  await page.keyboard.type(typingActivity('typing-g1-u01-a02')!.target);await expect(page.locator('.typing-result')).toBeVisible();
  await page.getByRole('button',{name:'Practise again',exact:true}).click();await expect(entry).toBeFocused();
  await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(entry).toBeFocused();
  await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Continue practice',exact:true}).click();await expect(entry).toBeFocused();
  await page.getByRole('button',{name:'Back to lesson',exact:true}).click();await page.getByRole('button',{name:'Continue practice',exact:true}).hover();
  await expect(page.getByRole('button',{name:'Continue practice',exact:true})).toHaveCSS('background-color','rgb(83, 50, 214)');
  await page.getByRole('button',{name:'Continue practice',exact:true}).click();await expect(entry).toBeFocused();
  await page.getByRole('button',{name:'Guide on',exact:true}).focus();await page.keyboard.press('x');await expect(entry.locator('.typing-character.current')).toHaveAttribute('data-position','0');
  await page.getByLabel('Typing settings',{exact:true}).click();const larger=page.getByLabel('Larger practice text',{exact:true});await larger.focus();await page.keyboard.press('Space');await expect(larger).toBeFocused();
  await page.getByLabel('Typing settings',{exact:true}).click();await page.getByRole('button',{name:'Try again',exact:true}).hover();await expect(page.getByRole('button',{name:'Try again',exact:true})).toHaveCSS('background-color','rgb(239, 232, 255)');
  await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(entry).toBeFocused();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`.impeccable/review/typing-autofocus-${info.project.name}.png`,fullPage:true});
});

test('native repair and writing inputs also receive initial focus',async({page})=>{
  for(const id of ['typing-g3-u01-a09','typing-g3-u10-a12']){
    await page.goto(`/#/typing/grade-3/${id}`);const entry=page.locator('textarea#typing-entry');await expect(entry).toBeFocused();
    await page.keyboard.type('x');await expect(entry).toHaveValue(/x/);
  }
});
