import { z } from 'zod';
import { spriteNames, backdropNames, readSpriteSettings } from './spriteModel.js';
import { studioCharacters, studioBackdrops } from './studioCatalog.js';
import type { serialization } from 'blockly/core';
type BlockState = serialization.blocks.State;
const coordinate = z.number().finite().min(-100).max(100);
const point = z.tuple([z.number().min(0).max(400), z.number().min(0).max(400)]);
export const paintStroke = z.object({ tool: z.enum(['pen', 'line', 'rectangle', 'ellipse', 'eraser']), filled: z.boolean().optional(), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), width: z.number().min(1).max(24), points: z.array(point).min(1).max(200) }).strict();
export type PaintStroke = z.infer<typeof paintStroke>;
export const importedImage = z.string().max(80000).regex(/^data:image\/(?:png|jpeg|webp);base64,(?:[A-Za-z0-9+/]{4})+(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
const libraryBase = z.object({ kind: z.enum(['character', 'background']), ref: z.string().max(30) }).strict().refine(base => base.kind === 'character' ? studioCharacters.includes(base.ref as never) : studioBackdrops.includes(base.ref as never));
const imageBase = z.object({ kind: z.literal('image'), imageData: importedImage }).strict();
const asset = z.object({
  id: z.string().regex(/^[a-z0-9_-]{1,50}$/), name: z.string().min(1).max(40),
  kind: z.enum(['character', 'background', 'drawing', 'image']), purpose: z.enum(['costume', 'background']).optional(),
  ref: z.string().max(30).optional(), imageData: importedImage.optional(),
  base: z.union([libraryBase, imageBase]).optional(), strokes: z.array(paintStroke).max(40).optional(), paper: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).strict().refine(a => {
  if (a.kind !== 'drawing' && (a.base || a.strokes || a.paper)) return false;
  if (a.kind !== 'image' && a.imageData) return false;
  if (a.kind === 'character' && a.purpose === 'background' || a.kind === 'background' && a.purpose === 'costume') return false;
  if (a.base?.kind === 'image' && a.purpose !== 'background') return false;
  if (a.kind === 'image') return a.purpose === 'background' && !!a.imageData && !a.ref;
  if (a.kind === 'drawing') return !a.ref;
  return a.kind === 'character' ? studioCharacters.includes(a.ref as never) : studioBackdrops.includes(a.ref as never);
});
export type StudioAsset = z.infer<typeof asset>;
const code = z.record(z.string(), z.unknown());
export const studioProjectSchema = z.object({ version: z.literal(1), title: z.string().min(1).max(40), onboarding: z.enum(['started', 'completed', 'skipped']).optional(), starter: z.enum(['story', 'keyboard', 'bounce', 'racing', 'basketball', 'catch', 'garden', 'spaceQuest', 'tennis', 'tutorialQuestions', 'tutorialTimers', 'tutorialSprites', 'tutorialBehaviors']).optional(), selected: z.string().max(50), backdrop: z.string().max(50), assets: z.array(asset).min(1).max(24), sprites: z.array(z.object({ id: z.string().regex(/^[a-z0-9_-]{1,50}$/), name: z.string().min(1).max(24), costume: z.string().max(50), costumes: z.array(z.string().max(50)).min(1).max(12), x: coordinate, y: coordinate, angle: z.number().finite().min(0).max(359), size: z.number().min(20).max(180), visible: z.boolean(), code }).strict()).min(1).max(4), legacy: code.optional() }).strict().superRefine((project, context) => {
  const ids = project.assets.map(a => a.id), spriteIds = project.sprites.map(s => s.id);
  const fail = (message: string) => context.addIssue({ code: 'custom', message });
  if (new Set(ids).size !== ids.length || new Set(spriteIds).size !== spriteIds.length) fail('Use unique asset and sprite IDs.');
  if (!spriteIds.includes(project.selected)) fail('Select an existing sprite.');
  if (!project.assets.some(a => a.id === project.backdrop && isStudioBackground(a))) fail('Choose a background asset.');
  for (const sprite of project.sprites) if (!sprite.costumes.includes(sprite.costume) || sprite.costumes.some(id => !project.assets.some(a => a.id === id && !isStudioBackground(a)))) fail('Choose existing costumes for every sprite.');
  if (project.assets.reduce((n, a) => n + (a.strokes?.reduce((m, s) => m + s.points.length, 0) ?? 0), 0) > 2000) fail('Use at most 2,000 drawing points across this project.');
  if (JSON.stringify(project).length > 240000) fail('Project is too large to save. Remove unused code or artwork.');
});
export type StudioProject = z.infer<typeof studioProjectSchema>;
export type StudioSprite = StudioProject['sprites'][number];
export const blankStudioCode = (): Record<string, unknown> => ({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', id: 'play', x: 36, y: 36 }] } });
export const studioAssetId = () => `asset-${crypto.randomUUID().slice(0, 12)}`;
export const studioSpriteId = () => `sprite-${crypto.randomUUID().slice(0, 12)}`;
export function newStudioProject(): StudioProject {
  return { version: 1, title: 'Untitled project', selected: 'sprite-byte', backdrop: 'background-sky', assets: [{ id: 'costume-byte', name: 'Byte', kind: 'character', ref: 'Byte' }, { id: 'background-sky', name: 'Floating islands', kind: 'background', ref: 'sky' }], sprites: [{ id: 'sprite-byte', name: 'Byte', costume: 'costume-byte', costumes: ['costume-byte'], x: 0, y: 0, angle: 0, size: 100, visible: true, code: blankStudioCode() }] };
}
/** Retain original bytes separately, and turn legacy registration instructions into real event hats. */
export function migrateStudioCode(workspace: Record<string, unknown>): Record<string, unknown> {
  const copy = structuredClone(workspace), source = (copy.blocks as { blocks?: BlockState[] } | undefined)?.blocks;
  if (!source?.length) return blankStudioCode();
  const roots: BlockState[] = [];
  for (const root of source) {
    if (root.type !== 'ka_start') { roots.push(root); continue; }
    delete root.data;
    let tail = root, node = root.next?.block;
    delete root.next;
    while (node) {
      const next = node.next?.block; delete node.next;
      if (node.type === 'ka_on_event') {
        const event = String(node.fields?.EVENT ?? 'click');
        roots.push({ type: `ka_event_${event}`, id: node.id, x: 300 + roots.length * 40, y: 36 + roots.length * 80, ...(node.inputs?.DO?.block ? { next: { block: node.inputs.DO.block } } : {}) });
      } else { tail.next = { block: node }; tail = node; }
      node = next;
    }
    roots.unshift(root);
  }
  return { blocks: { languageVersion: 0, blocks: roots } };
}
export function readStudioProject(workspace?: Record<string, unknown>): StudioProject {
  if (workspace && Object.hasOwn(workspace, 'byteStudio')) return studioProjectSchema.parse(workspace.byteStudio);
  const project = newStudioProject();
  if (!workspace?.blocks) return project;
  const settings = readSpriteSettings(workspace);
  project.legacy = structuredClone(workspace);
  project.assets[0] = { ...project.assets[0], name: settings.character, ref: settings.character };
  project.assets[1].ref = settings.background;
  project.assets[1].name = settings.background;
  Object.assign(project.sprites[0], { name: settings.character, code: migrateStudioCode(workspace) });
  project.assets.push({ id: 'costume-friend', name: settings.buddy, kind: 'character', ref: settings.buddy });
  project.sprites.push({ id: 'sprite-friend', name: settings.buddy, costume: 'costume-friend', costumes: ['costume-friend'], x: settings.buddyX, y: settings.buddyY, angle: 0, size: 100, visible: true, code: blankStudioCode() });
  const inspect = (node: BlockState) => {
    const name = node.type === 'ka_sprite_character' ? String(node.fields?.CHARACTER) : undefined;
    const ref = node.type === 'ka_sprite_backdrop' ? String(node.fields?.BACKGROUND) : undefined;
    if (name && spriteNames.includes(name as never)) {
      let asset = project.assets.find(a => a.kind === 'character' && a.ref === name);
      if (!asset) { asset = { id: `legacy-costume-${name.toLowerCase()}`, name, kind: 'character', ref: name }; project.assets.push(asset); }
      if (!project.sprites[0].costumes.includes(asset.id)) project.sprites[0].costumes.push(asset.id);
    }
    if (ref && backdropNames.includes(ref as never) && !project.assets.some(a => a.kind === 'background' && a.ref === ref)) project.assets.push({ id: `legacy-background-${ref}`, name: ref, kind: 'background', ref });
    for (const input of Object.values(node.inputs ?? {})) if (input.block) inspect(input.block);
    if (node.next?.block) inspect(node.next.block);
  };
  for (const root of ((project.sprites[0].code.blocks as { blocks: BlockState[] }).blocks)) inspect(root);
  return studioProjectSchema.parse(project);
}
export const saveStudioProject = (project: StudioProject) => ({ byteStudio: studioProjectSchema.parse(project) });
export function readStudioBackup(data: unknown): StudioProject {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Missing project data.');
  const workspace = data as Record<string, unknown>;
  if (Object.hasOwn(workspace, 'byteStudio')) return readStudioProject(workspace);
  const roots = (workspace.blocks as { blocks?: { type?: string }[] } | undefined)?.blocks;
  if (!Array.isArray(roots) || !roots.some(root => root?.type === 'ka_start')) throw new Error('Missing project scripts.');
  return readStudioProject(workspace);
}
export { backgroundImage } from './studioCatalog.js';
export const isStudioBackground = (asset: StudioAsset) => asset.kind === 'background' || asset.kind === 'image' || asset.kind === 'drawing' && asset.purpose === 'background';
