export type TourRect = { left: number; top: number; width: number; height: number };
export type TourLayout = { target: TourRect; card: { left: number; top: number; position: 'fixed' | 'absolute' }; placement: 'right' | 'left' | 'bottom' | 'top'; arrow: number };
const gap = 16, edge = 12;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/** Place a content-sized callout against the visible target, not a viewport dock. */
export function placeTour(bounds: TourRect, panel: { width: number; height: number }, viewport: { width: number; height: number }, headerBottom: number, scroll: number): TourLayout {
  const safeTop = headerBottom + edge, safeBottom = viewport.height - edge;
  const right = bounds.left + bounds.width, bottom = bounds.top + bounds.height;
  const targetLeft = Math.max(4, bounds.left - 4), targetTop = Math.max(headerBottom + 4, bounds.top - 4);
  const target: TourRect = { left: targetLeft, top: targetTop, width: Math.max(0, Math.min(bounds.width + 8, viewport.width - targetLeft - 4)), height: Math.max(0, Math.min(viewport.height - 4, bottom + 4) - targetTop) };
  const sideTop = clamp(bounds.top, safeTop, safeBottom - panel.height);
  const centeredLeft = clamp(bounds.left, edge, viewport.width - panel.width - edge);
  const horizontalArrow = (left: number) => clamp(bounds.left + bounds.width / 2 - left, 24, panel.width - 24);
  const verticalArrow = (top: number) => clamp(target.top + target.height / 2 - top, 24, panel.height - 24);

  // If text scaling or a very short window makes the card taller than the
  // viewport, use ordinary document scrolling; never scroll inside the card.
  if (panel.height > safeBottom - safeTop) {
    return { target, card: { left: centeredLeft, top: bottom + scroll + gap, position: 'absolute' }, placement: 'bottom', arrow: horizontalArrow(centeredLeft) };
  }
  if (right + gap + panel.width <= viewport.width - edge) {
    return { target, card: { left: right + gap, top: sideTop, position: 'fixed' }, placement: 'right', arrow: verticalArrow(sideTop) };
  }
  if (bounds.left - gap - panel.width >= edge) {
    return { target, card: { left: bounds.left - gap - panel.width, top: sideTop, position: 'fixed' }, placement: 'left', arrow: verticalArrow(sideTop) };
  }
  if (bottom + gap + panel.height <= safeBottom) {
    return { target, card: { left: centeredLeft, top: bottom + gap, position: 'fixed' }, placement: 'bottom', arrow: horizontalArrow(centeredLeft) };
  }
  if (bounds.top - gap - panel.height >= safeTop) {
    return { target, card: { left: centeredLeft, top: bounds.top - gap - panel.height, position: 'fixed' }, placement: 'top', arrow: horizontalArrow(centeredLeft) };
  }
  // Tall palettes/canvases cannot fit beside a full-width phone callout. Keep
  // their visible upper section highlighted directly above the explanation.
  const top = safeBottom - panel.height;
  target.height = Math.max(0, Math.min(bottom + 4, top - gap) - targetTop);
  return { target, card: { left: centeredLeft, top, position: 'fixed' }, placement: 'bottom', arrow: horizontalArrow(centeredLeft) };
}
