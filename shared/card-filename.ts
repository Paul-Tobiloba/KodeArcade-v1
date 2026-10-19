/** ASCII-only attachment names: no paths, control characters, quotes or platform reserved names. */
export function cardFilename(name: string, kind: 'login' | 'home' | 'booklet' = 'login') {
  const prefix = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'learner';
  return `${prefix}-kodearcade-${kind === 'booklet' ? 'login-cards' : kind === 'home' ? 'home-login-card' : 'login-card'}.pdf`;
}
