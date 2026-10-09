import { characterFor } from './characters';
export default function CharacterSprite({ concept, labelled = false }: { concept: string; labelled?: boolean }) {
  const character = characterFor(concept);
  return <span className="character-sprite world-sprite" role={labelled ? 'img' : undefined} aria-label={labelled ? character.title : undefined} aria-hidden={!labelled} style={{ backgroundImage: `url('/images/worlds/${character.name.toLowerCase()}.png')` }} />;
}
