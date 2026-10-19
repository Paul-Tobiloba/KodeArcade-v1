import type { serialization } from 'blockly/core';
import { studioBehaviorFunctions, studioCreationFunctions } from './studioBehaviorDefinitions';
type Block = serialization.blocks.State;
export const studioSystemFunctions: { name: string; description: string; block: Block }[] = [
  { name: 'spin_right', description: 'Four quarter-turns make a full turn. Built from repeat and turn blocks.', block: {
    type: 'ka_studio_define', fields: { NAME: 'spin_right', PARAM: 'none' }, inputs: { DO: { block: {
      type: 'ka_studio_repeat', fields: { COUNT: 4 }, inputs: { DO: { block: { type: 'ka_sprite_turn', fields: { SIDE: 'right', ANGLE: 90 } } } },
    } } },
  } },
  { name: 'hop', description: 'Move up, wait, then move down. Built from coordinate and wait blocks.', block: {
    type: 'ka_studio_define', fields: { NAME: 'hop', PARAM: 'none' }, inputs: { DO: { block: {
      type: 'ka_studio_axis', fields: { AXIS: 'y', MODE: 'change' }, inputs: { VALUE: { block: { type: 'ka_number', fields: { NUM: 12 } } } }, next: { block: {
        type: 'ka_sprite_wait', fields: { SECONDS: .3 }, next: { block: {
          type: 'ka_studio_axis', fields: { AXIS: 'y', MODE: 'change' }, inputs: { VALUE: { block: { type: 'ka_number', fields: { NUM: -12 } } } },
        } },
      } },
    } } },
  } },
];
studioSystemFunctions.push(...studioBehaviorFunctions, ...studioCreationFunctions);
export const isSystemFunction = (name: string) => studioSystemFunctions.some(f => f.name === name);
