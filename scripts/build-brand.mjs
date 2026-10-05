import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const font = readFileSync(root + 'public/fonts/Fredoka.ttf').toString('base64');
const shape = (a, b, c) => `<path fill="${a}" d="M10 4h15q7 0 7 7v15q0 4-4 6l-5 3v10l5 3q4 2 4 6v15q0 7-7 7H10q-7 0-7-7V11q0-7 7-7Z"/><path fill="${b}" d="M43 7q3-3 7-3h23q5 0 5 5v12q0 3-3 5L49 40q-3 2-6 0l-8-5V20q0-4 3-7Z"/><path fill="${c}" d="m43 44 6-4 26 25q3 2 3 5v1q0 5-5 5H50q-4 0-7-3l-5-6q-3-3-3-7V49Z"/>`;
mkdirSync(root + 'public/brand', { recursive: true });
for (const [variant, colors, ink] of [
  ['color', ['#6D4AFF','#0F9F8F','#F6C445'], '#172033'],
  ['reverse', ['#FFFFFF','#0F9F8F','#F6C445'], '#FFFFFF'],
  ['mono', ['#172033','#172033','#172033'], '#172033'],
  ['white', ['#FFFFFF','#FFFFFF','#FFFFFF'], '#FFFFFF'],
]) {
  const symbol = shape(...colors);
  writeFileSync(root + `public/brand/mark-${variant}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 80" role="img" aria-label="KodeArcade">${symbol}</svg>`);
  writeFileSync(root + `public/brand/logo-${variant}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 90" role="img" aria-label="KodeArcade — Play. Build. Learn."><defs><style>@font-face{font-family:Brand;src:url(data:font/ttf;base64,${font})}text{font-family:Brand,sans-serif}</style></defs><g transform="translate(0 5)">${symbol}</g><text x="98" y="55" fill="${ink}" font-size="57" font-weight="600" letter-spacing="-1">KodeArcade</text><text x="101" y="80" fill="${ink}" font-size="17" font-weight="400" letter-spacing="2">Play. Build. Learn.</text></svg>`);
}
writeFileSync(root + 'public/brand/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="#6D4AFF"/><g transform="translate(14 15) scale(.82)">${shape('#FFFFFF','#0F9F8F','#F6C445')}</g></svg>`);
