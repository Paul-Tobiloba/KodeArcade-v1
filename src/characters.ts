export const cast = {
  Byte: { name: 'Byte', title: 'Byte the Robot', world: 'Robot City', column: 0, row: 0 },
  Dash: { name: 'Dash', title: 'Dash the Rabbit', world: 'Compass Canyon', column: 0, row: 0 },
  Gigi: { name: 'Gigi', title: 'Gigi the Gecko', world: 'Looping Jungle', column: 1, row: 0 },
  Fix: { name: 'Fix', title: 'Fix the Fox', world: 'Bug Workshop', column: 2, row: 0 },
  Milo: { name: 'Milo', title: 'Milo the Monkey', world: 'Decision Jungle', column: 0, row: 1 },
  Nova: { name: 'Nova', title: 'Nova the Squirrel', world: 'Treasure Grove', column: 1, row: 1 },
};
export function characterFor(concept: string) {
  return cast[({ 'Direction & order': 'Dash', Loops: 'Gigi', Debugging: 'Fix', Conditionals: 'Milo', Variables: 'Nova' } as Record<string, keyof typeof cast>)[concept] ?? 'Byte'];
}
