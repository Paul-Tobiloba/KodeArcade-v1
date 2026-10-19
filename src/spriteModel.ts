export const spriteNames = ['Byte', 'Dash', 'Gigi', 'Fix', 'Milo', 'Nova', 'Pip'] as const;
export const backdropNames = ['sky', 'city', 'meadow', 'horizon'] as const;
export type SpriteSettings = { character: typeof spriteNames[number]; buddy: typeof spriteNames[number]; background: typeof backdropNames[number]; buddyX: number; buddyY: number };
export type SpriteState = SpriteSettings & { x: number; y: number; angle: number; speech: string; visible: boolean; events: string[]; used: string[]; score?: number; calls: number; output: (number | boolean)[] };
export const defaultSpriteSettings: SpriteSettings = { character: 'Byte', buddy: 'Dash', background: 'sky', buddyX: 50, buddyY: 0 };
export function spriteSettings(value: unknown): SpriteSettings {
  const v = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const coordinate = (n: unknown, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(-100, Math.min(100, n)) : fallback;
  return { character: spriteNames.includes(v.character as never) ? v.character as SpriteSettings['character'] : 'Byte', buddy: spriteNames.includes(v.buddy as never) ? v.buddy as SpriteSettings['buddy'] : 'Dash', background: backdropNames.includes(v.background as never) ? v.background as SpriteSettings['background'] : 'sky', buddyX: coordinate(v.buddyX, 50), buddyY: coordinate(v.buddyY, 0) };
}
export function readSpriteSettings(workspace?: Record<string, unknown>) {
  try { const blocks = workspace?.blocks as { blocks?: { type?: string; data?: string }[] } | undefined; return spriteSettings(JSON.parse(blocks?.blocks?.find(b => b.type === 'ka_start')?.data ?? '{}')); } catch { return { ...defaultSpriteSettings }; }
}
export const initialSprite = (settings: SpriteSettings): SpriteState => ({ ...settings, x: 0, y: 0, angle: 0, speech: '', visible: true, events: [], used: [], calls: 0, output: [] });
