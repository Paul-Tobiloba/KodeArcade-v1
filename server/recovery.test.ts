import { expect, it } from 'vitest';
import { recoveryAccess } from './recovery.js';
it('separates recovery keys across student, class, credential reset, course and server secret', () => {
  const original = recoveryAccess('synthetic-secret', 'a', 'class', 1, 'grade-2');
  for (const next of [recoveryAccess('synthetic-secret', 'b', 'class', 1, 'grade-2'), recoveryAccess('synthetic-secret', 'a', 'other', 1, 'grade-2'), recoveryAccess('synthetic-secret', 'a', 'class', 2, 'grade-2'), recoveryAccess('synthetic-secret', 'a', 'class', 1, 'grade-3'), recoveryAccess('new-secret', 'a', 'class', 1, 'grade-2')]) expect(next.key).not.toBe(original.key);
});
