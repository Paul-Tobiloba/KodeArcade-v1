export type ConceptTopic = 'operators' | 'boolean' | 'functions' | 'creative';
export type ConceptTask = { topic: ConceptTopic; required: string[]; score?: number; output?: (number | boolean)[]; minCalls?: number; creative?: { free?: boolean; x?: number; speech?: string; event?: 'click' | 'edge' | 'touch' } };
export const conceptTitles = { operators: 'Operators', boolean: 'Boolean logic', functions: 'Functions', creative: 'Creative coding' };
export function conceptPalette(topic: ConceptTopic, grade: number, required: string[] = []) {
  const common = ['ka_number', 'ka_arithmetic', 'ka_compute_score', 'ka_score_value'];
  if (topic === 'creative') return ['ka_on_event', 'ka_sprite_move', 'ka_sprite_turn', 'ka_sprite_goto', 'ka_sprite_bounce', 'ka_sprite_say', 'ka_sprite_say_value', 'ka_sprite_character', 'ka_sprite_backdrop', 'ka_sprite_visible', 'ka_sprite_wait', 'ka_sprite_touching', 'ka_repeat', 'ka_logic_if', ...common, 'ka_compare', 'ka_boolean_value', 'ka_boolean_join', 'ka_boolean_not', 'ka_show_number', 'ka_show_boolean', 'ka_function_define', 'ka_function_call', ...(grade >= 5 ? ['ka_parameter', 'ka_function_return', 'ka_function_value'] : [])];
  return topic === 'operators' ? common : topic === 'boolean' ? ['ka_number', 'ka_compare', 'ka_boolean_value', ...(required.some(t => t.startsWith('logic:')) ? ['ka_boolean_join'] : []), ...(required.includes('boolean_not') ? ['ka_boolean_not'] : []), 'ka_show_boolean', ...(required.includes('logic_if') ? ['ka_logic_if', 'ka_compute_score', 'ka_score_value'] : [])]
    : ['ka_function_define', 'ka_function_call', 'ka_show_number', 'ka_number', ...(grade >= 5 && (required.includes('parameter') || required.includes('function_return')) ? ['ka_parameter'] : []), ...(grade >= 5 && required.includes('function_return') ? ['ka_function_return', 'ka_function_value', 'ka_arithmetic'] : []), ...(required.includes('repeat') ? ['ka_repeat'] : [])];
}
export const creativeCategories = [
  { name: 'Events', colour: '#a16908', types: ['ka_on_event'] },
  { name: 'Motion', colour: '#08796e', types: ['ka_sprite_move', 'ka_sprite_turn', 'ka_sprite_goto', 'ka_sprite_bounce'] },
  { name: 'Looks', colour: '#6d4aff', types: ['ka_sprite_say', 'ka_sprite_say_value', 'ka_sprite_character', 'ka_sprite_backdrop', 'ka_sprite_visible'] },
  { name: 'Control', colour: '#b85a09', types: ['ka_repeat', 'ka_sprite_wait', 'ka_logic_if'] },
  { name: 'Sensing', colour: '#08796e', types: ['ka_sprite_touching'] },
  { name: 'Variables', colour: '#b53e75', types: ['ka_compute_score', 'ka_score_value'] },
  { name: 'Operators', colour: '#08796e', types: ['ka_number', 'ka_arithmetic', 'ka_compare', 'ka_boolean_value', 'ka_boolean_join', 'ka_boolean_not'] },
  { name: 'Functions', colour: '#6d4aff', types: ['ka_function_define', 'ka_function_call', 'ka_parameter', 'ka_function_return', 'ka_function_value'] },
  { name: 'Output', colour: '#08796e', types: ['ka_show_number', 'ka_show_boolean'] },
];
