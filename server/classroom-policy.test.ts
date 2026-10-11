import { expect, it } from 'vitest';
import { credentialPassword, generateCredential, usernameBases } from './classroom-policy.js';
import { credentialWords } from './credential-words.js';

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
