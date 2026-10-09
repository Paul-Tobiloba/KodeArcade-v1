// Original, silent diagram lesson. Generated binary output is reproducible.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540;
    const ctx = canvas.getContext('2d');
    const chunks = [], recorder = new MediaRecorder(canvas.captureStream(20), { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 800000 });
    recorder.ondataavailable = e => chunks.push(e.data);
    const done = new Promise(resolve => { recorder.onstop = resolve; });
    function draw(seconds) {
      ctx.fillStyle = '#f6f3ff'; ctx.fillRect(0,0,960,540);
      ctx.fillStyle = '#172033'; ctx.font = 'bold 34px sans-serif'; ctx.fillText('One arrow. One step.', 48,60);
      const step = seconds < 4 ? 0 : seconds < 7 ? 1 : seconds < 10 ? 2 : 3;
      const positions = [[0,4],[1,4],[2,4],[2,3]];
      for (let y=0;y<5;y++) for (let x=0;x<5;x++) {
        ctx.fillStyle = (x+y)%2 ? '#e0efdc' : '#edf6e9'; ctx.fillRect(48+x*72,100+y*72,72,72);
        ctx.strokeStyle = '#9cbea5'; ctx.strokeRect(48+x*72,100+y*72,72,72);
      }
      ctx.fillStyle = '#f8d04d'; ctx.fillRect(48+2*72,100+3*72,72,72);
      const [x,y]=positions[step]; ctx.fillStyle='#6d4aff'; ctx.fillRect(62+x*72,114+y*72,44,44);
      ctx.fillStyle='#172033'; ctx.font='20px sans-serif'; ctx.fillText('Byte',64+x*72,183+y*72);
      ['Right','Right','Up'].forEach((label,i)=>{
        ctx.fillStyle = i < step ? '#08796e' : '#e4ddfa'; ctx.fillRect(480,115+i*100,360,72);
        ctx.fillStyle = i < step ? '#fff' : '#302259'; ctx.font='bold 27px sans-serif'; ctx.fillText(`${i+1}. ${label}`,508,161+i*100);
      });
      ctx.fillStyle='#302259'; ctx.font='24px sans-serif'; ctx.fillText(step===3 ? 'In order, our arrows reach the star square.' : 'A sequence is instructions in order.',48,510);
    }
    draw(0); recorder.start(); const began=performance.now();
    await new Promise(resolve => { const timer=setInterval(()=>{ const seconds=(performance.now()-began)/1000; draw(seconds); if(seconds>=16){ clearInterval(timer); resolve(); } },50); });
    recorder.stop(); await done;
    return Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer()));
  });
  await writeFile(new URL('../public/lessons/grade-1-sequences.webm', import.meta.url), Buffer.from(bytes));
  console.log(`Sequence lesson generated (${bytes.length} bytes).`);
} finally { await browser.close(); }
