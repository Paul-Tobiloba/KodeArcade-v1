import { BookOpen, ArrowUp, ArrowRight, Repeat2, GitBranch, Variable, Hand } from 'lucide-react';
import type { Mission } from './learning';
import ConceptReference from './ConceptReference';
import { relativeMovement, degreeTurns } from './relativeMovement';

export default function CommandReference({ mission }: { mission: Mission }) {
  if (mission.conceptTask) return <details className="command-reference"><summary><BookOpen size={18} />Commands & examples</summary><ConceptReference mission={mission} /></details>;
  const relative = relativeMovement(mission);
  const commands = [
    ...(mission.dataTask?.topic === 'statements' ? [{ icon: ArrowRight, name: 'Move by steps', text: 'Choose a direction and distance. These inputs are arguments. One statement can move several squares.' }] : []),
    ...(mission.dataTask?.topic === 'lists' || mission.dataTask?.list ? [{ icon: Variable, name: 'Steps list', text: 'Create 1–8 values separated by commas. Index 0 reads the first item. Append adds at the end; set item replaces. Reading does not remove an item.' }] : []),
    ...(mission.dataTask?.topic === 'objects' ? [{ icon: Variable, name: 'Robot object', text: 'Create speed and energy properties. Read or set a property by name. Updating speed leaves energy unchanged. Reading does not consume either value.' }] : []),
    ...(relative ? [{ icon: ArrowRight, name: 'Forward / backward', text: 'Forward follows the facing arrow. Backward goes behind you without turning. Each basic block moves one square.' }, { icon: Repeat2, name: 'Turn left / right', text: 'Rotate 90° in place. A turn changes facing, not position.' }, ...(degreeTurns(mission) ? [{ icon: Repeat2, name: 'Turn by degrees', text: 'Use 90°, 180° or 270° on the square grid. Try other angles in the drawing lab.' }] : [])] : [{ icon: ArrowUp, name: 'Move up', text: 'One square toward the top.' }, { icon: ArrowRight, name: 'Move right', text: 'One square to the right.' }]),
    ...(mission.trail ? [{ icon: ArrowRight, name: 'Next path tile', text: 'Follow the marked trail around plants and holes. Collecting all carrots ends the task.' }] : []),
    ...(mission.loops ? [{ icon: Repeat2, name: 'Repeat', text: 'Run the blocks inside again.' }] : []),
    ...(mission.conditionals && !mission.collectibles && !mission.gate && !mission.river ? [{ icon: GitBranch, name: 'If path is clear', text: 'Check a direction before moving.' }] : []),
    ...(mission.variables ? [{ icon: Variable, name: 'Score', text: 'Store, change and use a number.' }] : []),
    ...(mission.collectibles ? [{ icon: Hand, name: 'Pick up item', text: `Collect a ${mission.collectibles.kind} on this square without moving.` }] : []),
    ...(mission.collectibles && mission.conditionals && mission.collectibles.kind !== 'key' ? [{ icon: GitBranch, name: 'If item here', text: 'Check this square before choosing an action.' }] : []),
    ...(mission.gate ? [{ icon: GitBranch, name: 'Gate locked?', text: 'Check beside the gate. Collect its key, return and open it.' }] : []),
    ...(mission.river ? [{ icon: GitBranch, name: 'Bridge missing?', text: 'Check from the bank. Build before you cross the water.' }] : []),
  ];
  return <details className="command-reference"><summary><BookOpen size={18} />Commands & examples</summary><div>{commands.map(({ icon: Icon, name, text }) => <article key={name}><strong><Icon size={19} />{name}</strong><p>{text}</p></article>)}</div></details>;
}
