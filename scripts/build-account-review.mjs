// Package the actual production app for the review harness's local HTML renderer.
// Only resource locations change; React components, controls and styles stay intact.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
const target = '.impeccable/review/runtime';
await mkdir(`${target}/assets`, { recursive: true });
const assets = await readdir('dist/assets');
for (const name of assets) {
  let content = await readFile(`dist/assets/${name}`, 'utf8');
  content = content.replaceAll('/images/', '/public/images/').replaceAll('/fonts/', '/public/fonts/').replaceAll('/brand/', '/public/brand/');
  content = content.replaceAll('"assets/', `"${target}/assets/`);
  await writeFile(`${target}/assets/${name}`, content);
}
let html = await readFile('dist/index.html', 'utf8');
html = html.replaceAll('/assets/', `/${target}/assets/`)
  .replaceAll('/brand/', '/public/brand/')
  .replace('<head>', '<head><script>history.replaceState(null,"",location.pathname+"#/login");</script>');
await writeFile(`${target}/index.html`, html);
console.log(JSON.stringify({ entry: `${target}/index.html`, dependencies: assets.map(name => `${target}/assets/${name}`) }, null, 2));
