import { characterFor } from './characters';
export default function CharacterSprite({ concept, labelled = false }: { concept: string; labelled?: boolean }) {
  const character = characterFor(concept);
  return <span className="character-sprite" role={labelled ? 'img' : undefined} aria-label={labelled ? character.title : undefined} aria-hidden={!labelled} style={{ backgroundPosition: `${character.column * 50}% ${character.row * 100}%` }} />;
}
