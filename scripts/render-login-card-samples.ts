import { writeFile } from 'node:fs/promises';
import { loginCards } from '../server/login-card.js';
const common = { className: 'Synthetic sample class', classCode: 'SAMPLE24', origin: 'http://127.0.0.1:5173' };
await writeFile('output/pdf/workflow-sample-booklet.pdf', await loginCards([
  { ...common, name: 'Synthetic Picture Student', username: 'samplepicture', grade: 2, method: 'picture', credential: ['star', 'rocket', 'leaf', 'robot'] },
  { ...common, name: 'Synthetic Text Student', username: 'sampletext', grade: 5, method: 'text', credential: 'watermelon butterfly mountain' },
]));
