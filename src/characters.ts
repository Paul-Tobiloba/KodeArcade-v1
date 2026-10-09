export const cast = {
  Byte: { name: 'Byte', title: 'Byte the Robot', world: 'Robot City', column: 0, row: 0 },
  Dash: { name: 'Dash', title: 'Dash the Rabbit', world: 'Compass Canyon', column: 0, row: 0 },
  Gigi: { name: 'Gigi', title: 'Gigi the Gecko', world: 'Looping Jungle', column: 1, row: 0 },
  Fix: { name: 'Fix', title: 'Fix the Fox', world: 'Bug Workshop', column: 2, row: 0 },
  Milo: { name: 'Milo', title: 'Milo the Monkey', world: 'Decision Jungle', column: 0, row: 1 },
  Nova: { name: 'Nova', title: 'Nova the Squirrel', world: 'Treasure Grove', column: 1, row: 1 },
  Pip: { name: 'Pip', title: 'Pip the Parrot', world: 'Sound Garden', column: 2, row: 1 },
};
export function characterFor(concept: string) {
  return cast[({ Drawing: 'Dash', 'Direction & order': 'Dash', Loops: 'Gigi', Debugging: 'Fix', Conditionals: 'Milo', Variables: 'Nova', Events: 'Pip', 'Computer Explorers': 'Pip' } as Record<string, keyof typeof cast>)[concept] ?? 'Byte'];
}

export const worldGoals: Record<string, string> = { Byte: 'charging station', Dash: 'carrot basket', Gigi: 'golden leaf', Fix: 'toolbox', Milo: 'banana basket', Nova: 'acorn basket', Pip: 'musical bell' };
