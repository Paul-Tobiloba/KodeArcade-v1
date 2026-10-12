import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pilotEnvironment, readGatewayToken } from './start-byte-pilot.mjs';
const token = 'synthetic_only_01234567890123456789';
test('local pilot scopes one adult, fixes loopback URL and does not mutate base env', () => {
  const env = { NODE_ENV: 'development', BYTE_PILOT_ENABLED: 'false', BYTE_GATEWAY_URL: 'https://unused.example', DATABASE_URL: 'synthetic' };
  const result = pilotEnvironment(['protected.env', 'adult1'], env, () => token);
  assert.equal(result.BYTE_PILOT_ENABLED, 'true'); assert.equal(result.BYTE_GATEWAY_TOKEN, token);
  assert.equal(result.BYTE_GATEWAY_URL, 'http://127.0.0.1:11435'); assert.equal(result.BYTE_PILOT_ADULT_IDS, 'adult1');
  assert.equal(result.DATABASE_URL, env.DATABASE_URL); assert.equal(env.BYTE_PILOT_ENABLED, 'false');
});
test('launcher rejects production, deployed Vercel and ambiguous adult allowlists before reading credentials', () => {
  const never = () => { throw new Error('should not read'); };
  for (const [args, env] of [[['file', 'adult'], { NODE_ENV: 'production' }], [['file', 'adult'], { VERCEL: '1' }], [[], {}], [['file', 'adult,other'], {}], [['file', 'adult', 'extra'], {}]]) {
    assert.throws(() => pilotEnvironment(args, env, never), /Local pilot only/);
  }
});
test('credential reader accepts only a small valid protected gateway env and redacts failures', () => {
  const dir = mkdtempSync(join(tmpdir(), 'byte-pilot-test-')); const file = join(dir, 'gateway.env');
  try {
    writeFileSync(file, `BYTE_GATEWAY_TOKEN=${token}\nBYTE_MODEL=qwen3.5:2b\n`); assert.equal(readGatewayToken(file), token);
    for (const value of ['BYTE_GATEWAY_TOKEN=weak', `BYTE_GATEWAY_TOKEN=${token}\nDATABASE_URL=sensitive`, 'x'.repeat(4097)]) {
      writeFileSync(file, value); assert.throws(() => readGatewayToken(file), /^Error: Cannot load the protected gateway credential file$/);
    }
    assert.throws(() => readGatewayToken(dir), /Cannot load/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
