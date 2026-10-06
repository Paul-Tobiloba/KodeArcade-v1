import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const configured = loadEnv(mode, '.', '').SITE_URL || '';
  const origin = configured ? new URL(configured).origin : '';
  if (origin && !origin.startsWith('https://')) throw new Error('SITE_URL must be a public HTTPS origin');
  return { plugins: [react(), { name: 'social-sharing', transformIndexHtml() {
    return [
      { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
      { tag: 'meta', attrs: { property: 'og:site_name', content: 'KodeArcade' } },
      { tag: 'meta', attrs: { property: 'og:title', content: 'KodeArcade — Play. Build. Learn.' } },
      { tag: 'meta', attrs: { property: 'og:description', content: 'Coding adventures for curious minds. Help Byte find a way forward, one block of code at a time.' } },
      { tag: 'meta', attrs: { property: 'og:image', content: `${origin}/social/kodearcade-share.png` } },
      { tag: 'meta', attrs: { property: 'og:image:alt', content: 'KodeArcade: Play. Build. Learn. Byte explores a glowing block pathway toward a star.' } },
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      { tag: 'meta', attrs: { name: 'twitter:title', content: 'KodeArcade — Play. Build. Learn.' } },
      { tag: 'meta', attrs: { name: 'twitter:description', content: 'Coding adventures for curious minds.' } },
      { tag: 'meta', attrs: { name: 'twitter:image', content: `${origin}/social/kodearcade-share.png` } },
      ...(origin ? [{ tag: 'meta', attrs: { property: 'og:url', content: `${origin}/` } }, { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` } }] : []),
    ];
  } }] };
});
