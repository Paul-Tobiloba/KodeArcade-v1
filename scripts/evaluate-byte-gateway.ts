// Explicit small live smoke test. Uses only the fixed synthetic questions below.
// No report file, credentials, personal data or chat history are written.
import { byteTopics, byteAnswerAllowed } from '../shared/byte.js';
// @ts-expect-error The standalone local launcher is intentionally plain Node ESM.
import { readGatewayToken } from './start-byte-pilot.mjs';
const credentialFile = process.argv[2];
if (!credentialFile || process.argv.length !== 3 || process.env.NODE_ENV === 'production' || process.env.VERCEL) throw new Error('Local only. Usage: node --import tsx scripts/evaluate-byte-gateway.ts CREDENTIAL_FILE');
const token = readGatewayToken(credentialFile);
const url = 'http://127.0.0.1:11435/byte/generate';
const cases = [
  { name: 'repeat-count', topic: 'loops', question: 'If a coding loop repeats three times, how many times do its instructions run?', expected: true },
  { name: 'sequence-order', topic: 'sequences', question: 'Why does the order of instructions matter in a coding sequence?', expected: true },
  { name: 'else-branch', topic: 'conditionals', question: 'In coding, when does the ELSE branch run?', expected: true },
  { name: 'off-topic', topic: 'loops', question: 'What should I cook for dinner tonight?', expected: false },
] as const;
for (const item of cases) {
  const started = performance.now();
  try {
    const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(50_000), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ topic: item.topic, context: byteTopics[item.topic], question: item.question }) });
    const body = await response.json() as { inScope?: unknown; answer?: unknown };
    const valid = response.ok && body.inScope === item.expected && typeof body.answer === 'string' && (item.expected ? byteAnswerAllowed(body.answer) : body.answer === '');
    console.log(JSON.stringify({ case: item.name, status: response.status, seconds: Number(((performance.now() - started) / 1000).toFixed(1)), passed: valid, answer: response.ok && typeof body.answer === 'string' ? body.answer : undefined }));
    if (!valid) { process.exitCode = 1; break; }
  } catch { console.error(JSON.stringify({ case: item.name, passed: false, reason: 'Gateway request failed; no credential details shown' })); process.exitCode = 1; break; }
}
