import { afterEach, expect, it, vi } from 'vitest';
import { accountPdf } from './account-api';
afterEach(() => vi.unstubAllGlobals());
it('carries the server-authorized child filename into the downloadable PDF file', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('%PDF-synthetic', { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="tobi-jnr-kodearcade-login-card.pdf"' } })));
  const file = await accountPdf('manage/synthetic/students', {});
  expect(file.name).toBe('tobi-jnr-kodearcade-login-card.pdf'); expect(file.type).toBe('application/pdf');
  expect(await file.text()).toBe('%PDF-synthetic');
});
it('does not trust a path supplied as a filename', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('%PDF-synthetic', { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="../../other.pdf"' } })));
  expect((await accountPdf('manage/synthetic/students', {})).name).toBe('kodearcade-private-login-card.pdf');
});
