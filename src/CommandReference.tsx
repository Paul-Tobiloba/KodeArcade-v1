import { BookOpen, ArrowUp, ArrowRight, Repeat2, GitBranch, Variable, Hand } from 'lucide-react';
import type { Mission } from './learning';

export default function CommandReference({ mission }: { mission: Mission }) {
  const commands = [
    { icon: ArrowUp, name: 'Move up', text: 'One square toward the top.' },
    { icon: ArrowRight, name: 'Move right', text: 'One square to the right.' },
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
