import { afterEach, expect, it, vi } from 'vitest';
import { credentialPassword, generateCredential, usernameBases, stepGrant, validStepGrant } from './classroom-policy.js';
import { credentialWords } from './credential-words.js';
import { managementUnlockSeconds } from '../shared/security-policy.js';

afterEach(() => vi.useRealTimers());
it('binds the 30-minute management grant to one session and rejects expiry, tampering and overlong grants', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
  expect(managementUnlockSeconds).toBe(1800);
  const grant = stepGrant('synthetic-secret', 'session-a');
  expect(validStepGrant('synthetic-secret', 'session-a', grant)).toBe(true);
  expect(validStepGrant('synthetic-secret', 'session-b', grant)).toBe(false);
  expect(validStepGrant('another-secret', 'session-a', grant)).toBe(false);
  expect(validStepGrant('synthetic-secret', 'session-a', stepGrant('synthetic-secret', 'session-a', Date.now() + 1801_000))).toBe(false);
  vi.advanceTimersByTime(29 * 60_000);
  expect(validStepGrant('synthetic-secret', 'session-a', grant)).toBe(true);
  vi.advanceTimersByTime(60_000);
  expect(validStepGrant('synthetic-secret', 'session-a', grant)).toBe(false);
});

it('issues three independent words from a sufficiently large unique classroom vocabulary', () => {
  expect(credentialWords.length).toBeGreaterThanOrEqual(800);
  expect(new Set(credentialWords).size).toBe(credentialWords.length);
  expect(credentialWords.every(word => /^[a-z]+$/.test(word))).toBe(true);
  for (let index = 0; index < 30; index++) {
    const phrase = generateCredential('text') as string;
    expect(phrase.split(' ')).toHaveLength(3);
    expect(phrase.split(' ').every(word => credentialWords.includes(word))).toBe(true);
  }
});
it('uses normalized first name, then first name and surname, with a safe fallback', () => {
  expect(usernameBases('Tobi Jnr')).toEqual(['tobi', 'tobijnr']);
  expect(usernameBases('  Ọlá Smith-Jones  ')).toEqual(['ola', 'olasmithjones']);
  expect(usernameBases('李')).toEqual(['student', 'student']);
});
it('normalizes phrase casing and spacing without breaking old printed credentials', () => {
  const secret = 'synthetic-policy-secret-only';
  expect(credentialPassword(secret, 'text', '  DESERT  Nose\tRiver ')).toBe(credentialPassword(secret, 'text', 'desert nose river'));
  expect(credentialPassword(secret, 'text', 'abcdefgh2345')).toBe(credentialPassword(secret, 'text', 'ABCDEFGH2345'));
});
