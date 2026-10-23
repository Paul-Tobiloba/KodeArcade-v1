import { ArrowRight, Gamepad2, Palette, Smartphone } from 'lucide-react';
import './lab-cards.css';

export const labDefinitions = [
  { id: 'byte', name: 'Byte Lab', path: 'lab', description: 'Make games, stories & animations', icon: Gamepad2, minimumGrade: 3 },
  { id: 'app', name: 'App Lab', path: 'apps', description: 'Design screens and build interactive apps', icon: Smartphone, minimumGrade: 3 },
  { id: 'artist', name: 'Artist Lab', path: 'art', description: 'Draw pictures and patterns with code', icon: Palette, minimumGrade: 1 },
] as const;
export type LabKey = typeof labDefinitions[number]['id'];
export type LabLink = { href: string; label: string };

export default function LabCards({ links, unavailableMessage = 'A course needs to be assigned first' }: { links: Partial<Record<LabKey, LabLink>>; unavailableMessage?: string }) {
  return <nav className="lab-card-grid" aria-label="Labs">{labDefinitions.map(lab => {
    const Icon = lab.icon, link = links[lab.id];
    const content = <><span className={`lab-card-icon lab-card-${lab.id}`} aria-hidden="true"><Icon size={30} /></span><span className="lab-card-copy"><strong>{lab.name}</strong><small>{link ? lab.description : unavailableMessage}</small></span>{link && <ArrowRight className="lab-card-arrow" size={19} aria-hidden="true" />}</>;
    return link ? <a key={lab.id} className="lab-card" href={link.href} aria-label={link.label}>{content}</a> : <div key={lab.id} className="lab-card lab-card-unavailable" aria-disabled="true">{content}</div>;
  })}</nav>;
}
