import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('application confirmation policy', () => {
  it('has no native browser alert/confirm/prompt calls in shipped application source', () => {
    const directory = fileURLToPath(new URL('.', import.meta.url));
    const violations: string[] = [];
    const scan = (path: string) => {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const file = join(path, entry.name);
        if (entry.isDirectory()) scan(file);
        else if (/\.(ts|tsx)$/.test(file) && !/\.test\./.test(file)) {
          const source = readFileSync(file, 'utf8');
          if (/\b(?:window|globalThis|self)\s*\.\s*(?:alert|confirm|prompt)\s*\(/.test(source)) violations.push(file);
          if (/\b(?:alert|prompt)\s*\(/.test(source)) violations.push(file);
          if (/\bconfirm\s*\(/.test(source) && !source.includes('useConfirmation')) violations.push(file);
        }
      }
    };
    scan(directory);
    expect(violations).toEqual([]);
  });
});
