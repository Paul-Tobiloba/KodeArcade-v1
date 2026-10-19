import type * as Blockly from 'blockly/core';
import { studioSystemFunctions } from './studioFunctions';
type State = Blockly.serialization.blocks.State;
const quote = (value: unknown) => JSON.stringify(String(value ?? ''));
/** A display-only translation. Nothing produced here is evaluated or sent to a service. */
export function studioCodeView(code: Record<string, unknown>, spriteName: string): string {
  let visited = 0;
  const usedSystemFunctions = new Set<string>();
  const rememberFunction = (name: unknown) => { const value = String(name); if (studioSystemFunctions.some(f => f.name === value)) usedSystemFunctions.add(value); return quote(value); };
  const guard = (depth: number) => { if (++visited > 2000 || depth > 32) throw new Error('Code view is too large. Simplify deeply nested blocks.'); };
  const expression = (b?: State, depth = 0): string => {
    guard(depth); if (!b) return '/* missing value */ undefined';
    const f = b.fields ?? {}, read = (name: string) => expression(b.inputs?.[name]?.block ?? b.inputs?.[name]?.shadow, depth + 1);
    switch (b.type) {
      case 'ka_studio_text': return quote(f.TEXT);
      case 'ka_studio_join': return `(String(${read('A')}) + String(${read('B')}))`;
      case 'ka_studio_text_variable': return `textVars[${quote(f.VAR)}]`;
      case 'ka_studio_text_compare': return f.OP === 'contains' ? `String(${read('A')}).includes(String(${read('B')}))` : `(String(${read('A')}) === String(${read('B')}))`;
      case 'ka_studio_timer': return `timerElapsed(${quote(f.UNIT)})`;
      case 'ka_studio_key_down': return `keyHeld(${quote(f.KEY)})`;
      case 'ka_studio_pointer_down': return 'pointer.pressed';
      case 'ka_studio_pointer_touch': return 'touchingPointer(sprite)';
      case 'ka_studio_color': return quote(f.COLOR);
      case 'ka_studio_random_color': return 'randomColor()';
      case 'ka_studio_location': return `location(${read('X')}, ${read('Y')})`;
      case 'ka_studio_random_location': return 'randomLocation()';
      case 'ka_studio_pointer_location': return 'pointerLocation()';
      case 'ka_studio_sprite_location': return `spriteLocation(${quote(f.SPRITE)})`;
      case 'ka_studio_location_offset': return `offsetLocation(${read('LOCATION')}, ${read('VALUE')}, ${quote(f.DIRECTION)})`;
      case 'ka_studio_location_axis': return `${read('LOCATION')}.${String(f.AXIS)}`;
      case 'ka_studio_sprite_ref': return `sprites(${quote(f.SPRITE)})`;
      case 'ka_studio_costume_group': return `spritesWithCostume(${quote(f.ASSET)})`;
      case 'ka_studio_sprite_count': return `${read('TARGET')}.length`;
      case 'ka_studio_last_created': return 'lastCreatedSprites()';
      case 'ka_studio_group_touching': return `touchingAny(${read('TARGET')})`;
      case 'ka_studio_costume_is': return `costumeIs(${quote(f.ASSET)})`;
      case 'ka_studio_math': return `Math.${({ square_root: 'sqrt', ceiling: 'ceil', absolute: 'abs' } as Record<string,string>)[String(f.OP)] ?? String(f.OP)}(${read('VALUE')})`;
      case 'ka_number': return String(Number(f.NUM));
      case 'ka_boolean_value': return f.BOOL === 'True' ? 'true' : 'false';
      case 'ka_score_value': return 'vars["score"]';
      case 'ka_studio_variable': return `vars[${quote(f.VAR)}]`;
      case 'ka_parameter': return 'value';
      case 'ka_arithmetic': return f.OP === '%' ? `positiveModulo(${read('A')}, ${read('B')})` : `(${read('A')} ${String(f.OP)} ${read('B')})`;
      case 'ka_compare': return `(${read('A')} ${String(f.OP)} ${read('B')})`;
      case 'ka_boolean_join': return `(${read('A')} ${f.OP === 'and' ? '&&' : '||'} ${read('B')})`;
      case 'ka_boolean_not': return `!(${read('VALUE')})`;
      case 'ka_studio_random': return `randomInteger(${read('A')}, ${read('B')})`;
      case 'ka_function_value': return `await functions[${rememberFunction(f.NAME)}](${b.inputs?.ARG ? read('ARG') : ''})`;
      case 'ka_sprite_touching': return `touching(${quote(f.TARGET)})`;
      case 'ka_studio_touching': return `touchingSprite(${quote(f.SPRITE)})`;
      case 'ka_studio_other_position': return `spritePosition(${quote(f.SPRITE)}, ${quote(f.AXIS)})`;
      case 'ka_studio_x': return 'sprite.x'; case 'ka_studio_y': return 'sprite.y';
      case 'ka_studio_heading': return 'sprite.direction'; case 'ka_studio_size_value': return 'sprite.size';
      default: throw new Error(`Code view does not support ${b.type}. Your saved blocks are unchanged.`);
    }
  };
  const body = (first?: State, indent = '  ', depth = 0, skipDefinitions = false): string => {
    let text = '';
    for (let b = first; b; b = b.next?.block) {
      guard(depth); const f = b.fields ?? {}, read = (name: string) => expression(b!.inputs?.[name]?.block ?? b!.inputs?.[name]?.shadow, depth + 1);
      const inside = (name: string) => body(b!.inputs?.[name]?.block, `${indent}  `, depth + 1, skipDefinitions);
      let line: string;
      switch (b.type) {
        case 'ka_studio_comment': line = `// ${String(f.TEXT ?? '').replace(/[\r\n]/g, ' ')}`; break;
        case 'ka_studio_set_text': line = `textVars[${quote(f.VAR)}] = String(${read('VALUE')});`; break;
        case 'ka_studio_say_text': line = `await say(String(${read('VALUE')}));`; break;
        case 'ka_studio_print': line = `printAt(String(${read('VALUE')}), ${read('LOCATION')});`; break;
        case 'ka_studio_prompt': case 'ka_studio_prompt_choices': line = `textVars[${quote(f.VAR)}] = await ask(String(${read('QUESTION')})${b.type === 'ka_studio_prompt_choices' ? `, [${[1,2,3].map(i => quote(f[`CHOICE${i}`])).join(', ')}]` : ''});`; break;
        case 'ka_studio_reset_timer': line = 'resetTimer();'; break;
        case 'ka_studio_background_color': line = `setBackgroundColor(${read('COLOR')});`; break;
        case 'ka_studio_title': line = `showTitle(String(${read('TITLE')}), String(${read('SUBTITLE')}));`; break;
        case 'ka_studio_hide_title': line = 'hideTitle();'; break;
        case 'ka_studio_sound': line = `playSound(${quote(f.SOUND)});`; break;
        case 'ka_studio_tint': line = `setTint(${read('COLOR')});`; break;
        case 'ka_studio_clear_tint': line = 'clearTint();'; break;
        case 'ka_studio_goto_location': line = `await jumpTo(${read('LOCATION')});`; break;
        case 'ka_studio_spawn': line = `createSprites(${read('COUNT')}, ${quote(f.SPRITE)}, ${quote(f.NAME)}, ${quote(f.ASSET)}, ${read('LOCATION')});`; break;
        case 'ka_studio_remove': line = `removeSprites(${read('TARGET')});`; break;
        case 'ka_studio_for_sprites': line = `for (const sprite of ${read('TARGET')}) {\n${inside('DO')}${indent}}`; break;
        case 'ka_studio_monitor_at': line = `showCounterAt(${quote(f.VAR)}, ${read('LOCATION')});`; break;
        case 'ka_studio_draggable': line = `setDraggable(${f.MODE === 'start'});`; break;
        case 'ka_studio_behavior': line = `${f.MODE === 'stop' ? 'stopBehavior' : 'startBehavior'}(${rememberFunction(f.NAME)});`; break;
        case 'ka_studio_stop_behaviors': line = 'stopSpriteBehaviors();'; break;
        case 'ka_studio_for': line = `{\n${indent}  const from = ${read('FROM')}, to = ${read('TO')}, by = ${read('BY')};\n${indent}  for (vars[${quote(f.VAR)}] = from; by > 0 ? vars[${quote(f.VAR)}] <= to : vars[${quote(f.VAR)}] >= to; vars[${quote(f.VAR)}] += by) {\n${body(b.inputs?.DO?.block, indent + '    ', depth + 1, skipDefinitions)}${indent}  }\n${indent}}`; break;
        case 'ka_studio_chance': line = `if (randomInteger(0, 999999) < (${read('VALUE')} * 10000)) {\n${inside('DO')}${indent}}`; break;
        case 'ka_function_define': case 'ka_studio_define': line = skipDefinitions ? `// ${String(f.NAME).replace(/[\r\n]/g, ' ')} is defined above, before events run.` : `functions[${quote(f.NAME)}] = async (${f.PARAM === 'value' ? 'value' : ''}) => {\n${inside('DO')}${indent}};`; break;
        case 'ka_function_call': line = `await functions[${rememberFunction(f.NAME)}](${b.inputs?.ARG ? read('ARG') : ''});`; break;
        case 'ka_function_return': line = `return ${read('VALUE')};`; break;
        case 'ka_compute_score': case 'ka_studio_set_variable': case 'ka_studio_change_variable': {
          const name = quote(b.type === 'ka_compute_score' ? 'score' : f.VAR);
          line = b.type === 'ka_studio_change_variable' ? `vars[${name}] = (vars[${name}] ?? 0) + ${read('VALUE')};` : `vars[${name}] = ${read('VALUE')};`; break;
        }
        case 'ka_studio_monitor': line = `${f.MODE === 'hide' ? 'hideCounter' : 'showCounter'}(${quote(f.VAR)});`; break;
        case 'ka_studio_forever': line = `while (running) {\n${inside('DO')}${indent}  await nextFrame();\n${indent}}`; break;
        case 'ka_repeat': case 'ka_studio_repeat': line = `for (let i = 0; i < ${Number(f.COUNT)}; i++) {\n${inside('DO')}${indent}}`; break;
        case 'ka_logic_if': case 'ka_studio_if': line = `if (${read('VALUE')}) {\n${inside('DO')}${indent}}${b.inputs?.ELSE?.block ? ` else {\n${inside('ELSE')}${indent}}` : ''}`; break;
        case 'ka_studio_wait_until': line = `while (!(${read('VALUE')})) await nextFrame();`; break;
        case 'ka_studio_stop': line = f.SCOPE === 'all' ? 'stopAll(); return;' : f.SCOPE === 'sprite' ? 'stopSpriteScripts(); return;' : 'return; // stop this script'; break;
        case 'ka_studio_axis': line = `await ${f.MODE === 'set' ? 'setPosition' : 'changePosition'}(${quote(f.AXIS)}, ${read('VALUE')});`; break;
        case 'ka_studio_point': line = `await pointDirection(${read('VALUE')});`; break;
        case 'ka_sprite_move': line = `await move(${quote(f.DIRECTION)}, ${read('VALUE')});`; break;
        case 'ka_sprite_goto': line = `await goTo(${read('X')}, ${read('Y')});`; break;
        case 'ka_sprite_turn': line = `await turn(${quote(f.SIDE)}, ${Number(f.ANGLE)});`; break;
        case 'ka_sprite_bounce': line = 'await bounceAtBorder();'; break;
        case 'ka_sprite_say': case 'ka_studio_say_for': line = `await say(${quote(f.TEXT)}${b.type === 'ka_studio_say_for' ? `, ${Number(f.SECONDS)}` : ''});`; break;
        case 'ka_sprite_say_value': line = `await say(String(${read('VALUE')}));`; break;
        case 'ka_sprite_wait': line = `await wait(${Number(f.SECONDS)});`; break;
        case 'ka_studio_size': line = `await setSize(${read('VALUE')});`; break;
        case 'ka_studio_costume': line = `await switchCostume(${quote(f.ASSET)});`; break;
        case 'ka_studio_next_costume': line = 'await nextCostume();'; break;
        case 'ka_studio_background': line = `await switchBackground(${quote(f.ASSET)});`; break;
        case 'ka_sprite_character': line = `await switchCharacter(${quote(f.CHARACTER)});`; break;
        case 'ka_sprite_backdrop': line = `await switchBackdrop(${quote(f.BACKGROUND)});`; break;
        case 'ka_sprite_visible': line = `${f.VISIBLE === 'show' ? 'show' : 'hide'}Sprite();`; break;
        case 'ka_studio_broadcast': line = `broadcast(${quote(f.MESSAGE)});`; break;
        case 'ka_show_number': case 'ka_show_boolean': line = `output(${read('VALUE')});`; break;
        default: throw new Error(`Connect ${b.type} below an event or inside a value input to view its code.`);
      }
      text += `${indent}${line}\n`;
    }
    return text;
  };
  const roots = (code.blocks as { blocks?: State[] } | undefined)?.blocks ?? [];
  const definitions = roots.filter(b => b.type === 'ka_studio_define');
  for (const root of roots.filter(b => b.type === 'ka_start')) for (let b = root.next?.block; b; b = b.next?.block) if (b.type === 'ka_function_define') { const copy = { ...b }; delete copy.next; definitions.push(copy); }
  let text = `// ${spriteName.replace(/[\r\n]/g, ' ')} — read-only JavaScript-style translation\n// Byte Lab supplies the sprite, event and motion APIs below.\n// This is a learning view, not a standalone JavaScript program.\nconst vars = { score: 0 };\nconst textVars = {};\nconst functions = {};\n\n`;
  for (const root of definitions) text += `${body(root, '')}\n`;
  for (const root of roots.filter(b => b.type !== 'ka_studio_define')) {
    const event = root.type === 'ka_start' ? 'onRun' : ({ ka_event_click: 'onClick', ka_event_key: 'onKey', ka_event_edge: 'onBorderTouch', ka_event_touch: 'onSpriteTouch', ka_event_message: 'onMessage', ka_event_at: 'atSeconds', ka_event_every: 'everySeconds', ka_event_answer: 'onAnswer', ka_event_answers: 'onAllAnswers', ka_event_created: 'onCreated' } as Record<string, string>)[root.type];
    if (!event) throw new Error('Connect loose blocks before using Show code.');
    const field = root.type === 'ka_event_key' ? root.fields?.KEY : root.type === 'ka_event_message' ? root.fields?.MESSAGE : root.type === 'ka_event_answer' ? root.fields?.VAR : ['ka_event_at', 'ka_event_every'].includes(root.type) ? root.fields?.SECONDS : undefined;
    text += `${event}(${field !== undefined ? `${quote(field)}, ` : ''}async () => {\n${body(root.next?.block, '  ', 0, true)}});\n\n`;
  }
  const printed = new Set<string>();
  for (const name of usedSystemFunctions) { const f = studioSystemFunctions.find(f => f.name === name); if (f && !printed.has(name)) { printed.add(name); text += `// Built-in (read-only): ${f.description}\n${body(f.block, '')}\n`; } }
  return text;
}
