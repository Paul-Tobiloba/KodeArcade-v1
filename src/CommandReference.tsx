import { BookOpen, ArrowUp, ArrowRight, Repeat2, GitBranch, Variable } from 'lucide-react';
import type { Mission } from './learning';

export default function CommandReference({ mission }: { mission: Mission }) {
  const commands = [
    { icon: ArrowUp, name: 'Move up', text: 'One square toward the top.' },
    { icon: ArrowRight, name: 'Move right', text: 'One square to the right.' },
    ...(mission.loops ? [{ icon: Repeat2, name: 'Repeat', text: 'Run the blocks inside again.' }] : []),
    ...(mission.conditionals ? [{ icon: GitBranch, name: 'If path is clear', text: 'Check a direction before moving.' }] : []),
    ...(mission.variables ? [{ icon: Variable, name: 'Score', text: 'Store, change and use a number.' }] : []),
  ];
  return <details className="command-reference"><summary><BookOpen size={18} />Commands & examples</summary><div>{commands.map(({ icon: Icon, name, text }) => <article key={name}><strong><Icon size={19} />{name}</strong><p>{text}</p></article>)}</div></details>;
}
