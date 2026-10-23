import { useEffect, useState, type ReactNode } from 'react';
import { characterFor } from './characters';
export default function CharacterSprite({ concept, labelled = false, fallback }: { concept: string; labelled?: boolean; fallback?: ReactNode }) {
  const character = characterFor(concept);
  const source = `/images/worlds/${character.name.toLowerCase()}.png`, needsFallback = fallback !== undefined;
  const [loadedSource, setLoadedSource] = useState('');
  useEffect(() => {
    if (!needsFallback) return;
    let active = true;
    const image = new Image();
    image.onload = () => { if (active) setLoadedSource(source); };
    image.src = source;
    return () => { active = false; image.onload = null; };
  }, [source, needsFallback]);
  const ready = !needsFallback || loadedSource === source;
  return <span className="character-sprite world-sprite" role={labelled ? 'img' : undefined} aria-label={labelled ? character.title : undefined} aria-hidden={!labelled} style={{ backgroundImage: ready ? `url('${source}')` : 'none' }}>{!ready && fallback}</span>;
}
