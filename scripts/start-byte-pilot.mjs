// Explicit local-only launcher. Never persists the token or edits .env.
import { readFileSync, statSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function readGatewayToken(path) {
  try {
    const info = statSync(path);
    if (!info.isFile() || info.size > 4096) throw new Error();
    const fields = parseEnv(readFileSync(path, 'utf8'));
    if (Object.keys(fields).some(key => !['BYTE_GATEWAY_TOKEN', 'BYTE_MODEL'].includes(key))) throw new Error();
    const token = fields.BYTE_GATEWAY_TOKEN ?? '';
    if (!/^[A-Za-z0-9_-]{32,256}$/.test(token) || /REPLACE|EXAMPLE/i.test(token)) throw new Error();
    return token;
  } catch { throw new Error('Cannot load the protected gateway credential file'); }
}

export function pilotEnvironment(args, env, readToken = readGatewayToken) {
  if (env.NODE_ENV === 'production' || env.VERCEL || args.length !== 2 || !args[0] || !/^[A-Za-z0-9_-]{1,100}$/.test(args[1])) {
    throw new Error('Local pilot only. Usage: node scripts/start-byte-pilot.mjs CREDENTIAL_FILE ADULT_USER_ID');
  }
  return { ...env, BYTE_PILOT_ENABLED: 'true', BYTE_GATEWAY_URL: 'http://127.0.0.1:11435', BYTE_GATEWAY_TOKEN: readToken(args[0]), BYTE_PILOT_ADULT_IDS: args[1] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (existsSync('.env')) process.loadEnvFile('.env');
    const env = pilotEnvironment(process.argv.slice(2), process.env);
    const child = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: 'inherit' });
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
    child.once('error', () => { console.error('Private pilot failed to start'); process.exitCode = 1; });
    child.once('exit', code => { process.exitCode = code ?? 1; });
  } catch { console.error('Private local pilot could not start. Check the credential path, adult ID and local configuration.'); process.exitCode = 1; }
}
