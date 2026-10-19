import { z } from 'zod';
import { readStudioProject, studioProjectSchema, type StudioProject } from '../src/studioProject.js';

export const galleryLimit = 20;
export const galleryBytes = 600000;
const id = z.string().regex(/^[a-z0-9_-]{1,60}$/);
const date = z.string().datetime();
export const studioGallerySchema = z.object({
  version: z.literal(1), activeId: id.nullable(),
  projects: z.array(z.object({ id, createdAt: date, updatedAt: date, deletedAt: date.optional(), project: studioProjectSchema }).strict()).max(galleryLimit),
}).strict().superRefine((gallery, ctx) => {
  if (new Set(gallery.projects.map(p => p.id)).size !== gallery.projects.length) ctx.addIssue({ code: 'custom', message: 'Project IDs must be unique.' });
  if (gallery.activeId && !gallery.projects.some(p => p.id === gallery.activeId && !p.deletedAt)) ctx.addIssue({ code: 'custom', message: 'Open an existing, non-deleted project.' });
  if (new TextEncoder().encode(JSON.stringify({ byteStudioGallery: gallery })).length > galleryBytes) ctx.addIssue({ code: 'custom', message: 'Gallery storage is full.' });
});
export type StudioGallery = z.infer<typeof studioGallerySchema>;
export type StudioGalleryEntry = StudioGallery['projects'][number];
export const newProjectId = () => `project-${crypto.randomUUID()}`;
export function galleryEntry(project: StudioProject, now = new Date().toISOString()): StudioGalleryEntry {
  return { id: newProjectId(), createdAt: now, updatedAt: now, project: studioProjectSchema.parse(project) };
}
export function readStudioGallery(workspace?: Record<string, unknown>): StudioGallery {
  if (workspace && Object.hasOwn(workspace, 'byteStudioGallery')) return studioGallerySchema.parse(workspace.byteStudioGallery);
  // Upgrade only in memory; the caller publishes through the existing save flow.
  // Migration retains the old project's code, art, tour state and raw legacy data.
  const entry = galleryEntry(readStudioProject(workspace));
  return { version: 1, activeId: entry.id, projects: [entry] };
}
export const saveStudioGallery = (gallery: StudioGallery) => ({ byteStudioGallery: studioGallerySchema.parse(gallery) });
export function validWorkspace(value: Record<string, unknown>): boolean {
  if (Object.hasOwn(value, 'byteStudioGallery')) return Object.keys(value).length === 1 && studioGallerySchema.safeParse(value.byteStudioGallery).success;
  if (Object.hasOwn(value, 'byteStudio')) return Object.keys(value).length === 1 && studioProjectSchema.safeParse(value.byteStudio).success;
  return JSON.stringify(value).length <= 100000;
}
