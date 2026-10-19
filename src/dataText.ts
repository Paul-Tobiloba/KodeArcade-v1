// Explicit grammar only: no eval, imports, attribute execution or arbitrary code.
export function parseDataStatement(text: string): { type: string; fields: Record<string, string | number> } | undefined {
  let match: RegExpExecArray | null;
  const number = (raw: string) => {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0 || value > 9) throw new Error('Data values must be whole numbers from 0 to 9.');
    return value;
  };
  const index = (raw: string) => {
    const value = number(raw);
    if (value > 7) throw new Error('List indexes in this lab range from 0 to 7. Check the list length too.');
    return value;
  };
  if ((match = /^(forward|backward)\(\)$/.exec(text))) return { type: `ka_${match[1]}`, fields: {} };
  if ((match = /^turn_(left|right)\(\)$/.exec(text))) return { type: `ka_turn_${match[1]}`, fields: {} };
  if ((match = /^turn_(left|right)\((\d+)\)$/.exec(text))) {
    if (![90, 180, 270].includes(Number(match[2]))) throw new Error('Grid turns use 90, 180 or 270 degrees. Drawing supports other angles.');
    return { type: 'ka_turn_degrees', fields: { SIDE: match[1], DEGREES: match[2] } };
  }
  if ((match = /^(forward|backward)\((\d+)\)$/.exec(text))) return { type: 'ka_relative_move_steps', fields: { DIRECTION: match[1], VALUE: number(match[2]) } };
  if ((match = /^(forward|backward)\(steps\[(\d+)\]\)$/.exec(text))) return { type: 'ka_relative_list_move', fields: { DIRECTION: match[1], INDEX: index(match[2]) } };
  if ((match = /^(forward|backward)\(robot\[["'](speed|energy)["']\]\)$/.exec(text))) return { type: 'ka_relative_object_move', fields: { DIRECTION: match[1], PROPERTY: match[2] } };
  if ((match = /^(forward|backward)\(score\)$/.exec(text))) return { type: 'ka_relative_move_score', fields: { DIRECTION: match[1] } };
  if ((match = /^move\(["'](right|left|up|down)["'],\s*(\d+)\)$/.exec(text))) return { type: 'ka_move_steps', fields: { DIRECTION: match[1], VALUE: number(match[2]) } };
  if ((match = /^steps\s*=\s*\[\s*(\d+(?:\s*,\s*\d+){0,7})\s*\]$/.exec(text))) return { type: 'ka_list_set', fields: { ITEMS: match[1].split(',').map(item => number(item.trim())).join(', ') } };
  if ((match = /^steps\.append\((\d+)\)$/.exec(text))) return { type: 'ka_list_append', fields: { VALUE: number(match[1]) } };
  if ((match = /^steps\[(\d+)\]\s*=\s*(\d+)$/.exec(text))) return { type: 'ka_list_update', fields: { INDEX: index(match[1]), VALUE: number(match[2]) } };
  if ((match = /^move\(["'](right|left|up|down)["'],\s*steps\[(\d+)\]\)$/.exec(text))) return { type: 'ka_list_move', fields: { DIRECTION: match[1], INDEX: index(match[2]) } };
  if ((match = /^robot\s*=\s*\{\s*["']speed["']\s*:\s*(\d+),\s*["']energy["']\s*:\s*(\d+)\s*\}$/.exec(text))) return { type: 'ka_object_set', fields: { SPEED: number(match[1]), ENERGY: number(match[2]) } };
  if ((match = /^robot\[["'](speed|energy)["']\]\s*=\s*(\d+)$/.exec(text))) return { type: 'ka_object_update', fields: { PROPERTY: match[1], VALUE: number(match[2]) } };
  if ((match = /^move\(["'](right|left|up|down)["'],\s*robot\[["'](speed|energy)["']\]\)$/.exec(text))) return { type: 'ka_object_move', fields: { DIRECTION: match[1], PROPERTY: match[2] } };
  if ((match = /^robot\[["'](speed|energy)["']\]\s*=\s*steps\[(\d+)\]$/.exec(text))) return { type: 'ka_object_from_list', fields: { PROPERTY: match[1], INDEX: index(match[2]) } };
  return undefined;
}
