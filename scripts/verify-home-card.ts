import { mkdir, writeFile } from 'node:fs/promises';
import { loginCards } from '../server/login-card.js';

// Fixed synthetic examples only. Never pass real credentials to this visual check.
await mkdir('output/family-card', { recursive: true });
const base = { name: 'Sample Home Learner With A Longer Family Name', username: 'samplelearner', className: 'Our sample family adventures', classCode: 'ABCDEFGH', grade: 2, origin: 'http://127.0.0.1:5173', context: 'home' as const };
const pdf = await loginCards([{ ...base, method: 'text', credential: 'desert gentle meadow' }, { ...base, method: 'picture', credential: ['sun', 'rocket', 'leaf', 'robot'] }]);
await writeFile('output/family-card/home-login-card.pdf', pdf);
console.log('Synthetic text and picture home-card PDF generated for visual inspection.');
