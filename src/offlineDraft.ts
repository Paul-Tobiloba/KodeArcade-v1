import { progressDocument, validCourseDocument, type GradeKey, type ProgressDocument } from '../shared/progress';

export type RecoveryAccess = { key: string; slot: string; owner: string };
export type RecoveryDraft = { revision: number; document: ProgressDocument };
const prefix = 'kodearcade-recovery-v1:';
const lifetime = 7 * 86400_000;
const activeStores = new Set<OfflineDraft>();
const encode = (bytes: Uint8Array) => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
const decode = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));

// Authenticated API responses supply the key. Never persist it, a student name,
// credentials, or plaintext work. This is not protection from same-origin XSS.
export class OfflineDraft {
  private queue: Promise<void> = Promise.resolve();
  private closed = false;
  private key: Promise<CryptoKey>;
  private storageKey: string;
  constructor(private access: RecoveryAccess, private course: GradeKey, private storage: Storage = localStorage) {
    this.storageKey = prefix + access.slot;
    this.key = crypto.subtle.importKey('raw', decode(access.key), 'AES-GCM', false, ['encrypt', 'decrypt']);
    activeStores.add(this);
  }
  async read(): Promise<RecoveryDraft | null> {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      const envelope = JSON.parse(raw);
      if (envelope.owner !== this.access.owner || !Number.isFinite(envelope.expires) || envelope.expires < Date.now()) { this.storage.removeItem(this.storageKey); return null; }
      const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(envelope.iv), additionalData: new TextEncoder().encode(this.storageKey) }, await this.key, decode(envelope.data));
      const value = JSON.parse(new TextDecoder().decode(data));
      const parsed = progressDocument.safeParse(value.document);
      if (!Number.isInteger(value.revision) || value.revision < 0 || !parsed.success || !validCourseDocument(this.course, parsed.data)) throw new Error('Invalid recovery draft');
      return { revision: value.revision, document: parsed.data };
    } catch { throw new Error('The device recovery copy could not be read. Your account copy is unchanged.'); }
  }
  write(draft: RecoveryDraft | null): Promise<void> {
    if (this.closed) return Promise.resolve();
    const captured = draft ? JSON.stringify(draft) : null;
    const next = this.queue.catch(() => {}).then(async () => {
      if (this.closed) return;
      if (!captured) { this.storage.removeItem(this.storageKey); return; }
      if (captured.length > 950000) throw new Error('Recovery copy is too large');
      // Bound retained data without evicting another pupil's live draft.
      let slots = 0;
      for (const key of Object.keys(this.storage)) {
        if (!key.startsWith(prefix)) continue;
        try { if (JSON.parse(this.storage.getItem(key)!).expires < Date.now()) { this.storage.removeItem(key); continue; } } catch { /* Leave unrelated/corrupt copies alone. */ }
        slots++;
      }
      if (slots >= 12 && !this.storage.getItem(this.storageKey)) throw new Error('Device recovery storage is full');
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(this.storageKey) }, await this.key, new TextEncoder().encode(captured));
      if (!this.closed) this.storage.setItem(this.storageKey, JSON.stringify({ owner: this.access.owner, expires: Date.now() + lifetime, iv: encode(iv), data: encode(new Uint8Array(encrypted)) }));
    });
    this.queue = next;
    return next;
  }
  get owner() { return this.access.owner; }
  async discard() { this.closed = true; activeStores.delete(this); await this.queue.catch(() => {}); this.storage.removeItem(this.storageKey); }
  release() { void this.queue.finally(() => activeStores.delete(this)).catch(() => {}); }
}
export function clearOfflineOwner(owner?: string) {
  if (!owner) return;
  for (const store of activeStores) if (store.owner === owner) void store.discard().catch(() => {});
  try { for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) { try { if (JSON.parse(localStorage.getItem(key)!).owner === owner) localStorage.removeItem(key); } catch { /* Not this student's copy. */ } } } catch { /* Storage may be disabled. */ }
}
export function hasOfflineOwner(owner?: string) {
  if (!owner) return false;
  try { return Object.keys(localStorage).some(key => { if (!key.startsWith(prefix)) return false; try { const value = JSON.parse(localStorage.getItem(key)!); return value.owner === owner && value.expires > Date.now(); } catch { return false; } }); } catch { return false; }
}
