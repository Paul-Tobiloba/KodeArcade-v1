import { expect, it } from 'vitest';
import { placeTour } from './tourLayout';

it('keeps short-wide mission explanations directly below the full-width highlight', () => {
  const result = placeTour({ left: 12, top: 88, width: 1284, height: 80 }, { width: 460, height: 310 }, { width: 1308, height: 590 }, 68, 0);
  expect(result.placement).toBe('bottom'); expect(result.card.top).toBe(184);
  expect(result.card.top + 310).toBeLessThan(590);
  expect(result.card.left).toBe(12);
});
it.each(['right', 'left'] as const)('uses the %s side when there is space, independent of viewport height', side => {
  const bounds = { left: side === 'right' ? 12 : 800, top: 88, width: 300, height: 80 };
  const result = placeTour(bounds, { width: 400, height: 320 }, { width: 1308, height: 590 }, 68, 0);
  expect(result.placement).toBe(side);
  expect(result.card.top).toBe(88);
});
it('places a bottom-edge target above the explanation without overlap', () => {
  const result = placeTour({ left: 12, top: 700, width: 388, height: 48 }, { width: 388, height: 310 }, { width: 412, height: 839 }, 108, 0);
  expect(result.placement).toBe('top'); expect(result.card.top + 310).toBe(684);
});
it('keeps a tall phone canvas visible immediately above a full-height callout', () => {
  const result = placeTour({ left: 12, top: 128, width: 388, height: 418 }, { width: 388, height: 350 }, { width: 412, height: 839 }, 108, 0);
  expect(result.placement).toBe('bottom'); expect(result.card.top).toBe(477);
  expect(result.target.top + result.target.height + 16).toBe(result.card.top);
  expect(result.target.height).toBeGreaterThan(250);
});
it('uses document scrolling for content taller than the viewport instead of an internal scrollbar', () => {
  const result = placeTour({ left: 12, top: 100, width: 388, height: 80 }, { width: 388, height: 400 }, { width: 412, height: 360 }, 68, 500);
  expect(result.card.position).toBe('absolute'); expect(result.card.top).toBe(696);
  expect(result.placement).toBe('bottom');
});
