import { expect, it } from 'vitest';
import { cardFilename } from '../shared/card-filename';
it('prefixes private PDF downloads with a safe learner or class name', () => {
  expect(cardFilename('Tobi Jnr')).toBe('tobi-jnr-kodearcade-login-card.pdf');
  expect(cardFilename('Émilie', 'home')).toBe('emilie-kodearcade-home-login-card.pdf');
  expect(cardFilename('Grade 2 Lab', 'booklet')).toBe('grade-2-lab-kodearcade-login-cards.pdf');
  for (const value of ['../../bad"\r\nX: value', 'CON', '😀', 'a'.repeat(300)]) expect(cardFilename(value)).toMatch(/^[a-z0-9-]{1,110}\.pdf$/);
});
