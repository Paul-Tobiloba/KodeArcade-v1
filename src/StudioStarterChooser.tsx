import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { studioStarters } from './studioStarters';
import { studioTutorials, type StudioProjectChoice } from './studioTutorials';
import { backgroundImage } from './studioProject';
import { characterImage, characterIsAtlas } from './studioCatalog';
export default function StudioStarterChooser({ onChoose, welcome = false }: { onChoose: (starter: StudioProjectChoice | null) => void; welcome?: boolean }) {
  const [tutorials, setTutorials] = useState(false), choices = tutorials ? studioTutorials : studioStarters;
  return <section className="studio-start" aria-label="Byte Lab starter projects">
    {welcome && <><h2>What will you make?</h2><p>Start with working code, change one thing, and make it yours. A short optional tour will show you around.</p></>}
    <div className="studio-starter-modes" role="group" aria-label="Project starting points"><button aria-pressed={!tutorials} onClick={() => setTutorials(false)}>Games & stories</button><button aria-pressed={tutorials} onClick={() => setTutorials(true)}>Block tutorials</button></div>
    {tutorials && <p>Four short projects with working blocks and optional steps. Make changes at your own pace; these are not graded lessons.</p>}
    <ul className="studio-starter-list">{choices.map(starter => <li key={starter.id}><button className="studio-starter-option" aria-label={`Start ${starter.title}`} onClick={() => onChoose(starter.id)}>
      <span className="studio-starter-preview" style={{ backgroundImage: `url('${backgroundImage[starter.background]}')` }} aria-hidden="true">{starter.characters.map(character => characterIsAtlas(character) ? <span key={character} className="studio-art-sprite" style={{ backgroundImage: `url('${characterImage(character)}')` }} /> : <img key={character} className="studio-cutout" src={characterImage(character)} alt="" loading="lazy" />)}</span>
      <strong>{starter.title}</strong><span>{starter.description}</span><span className="studio-starter-action">Make this project<ArrowRight size={17} /></span>
    </button></li>)}</ul>
    <button className="studio-blank-start" onClick={() => onChoose(null)}>Start with a blank project<ArrowRight size={17} /></button>
  </section>;
}
