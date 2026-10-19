import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGateway, gatewayConfig } from './byte-gateway.mjs';
const token = 'synthetic_only_01234567890123456789';
const data = { topic: 'loops', context: { title: 'Loops', explanation: 'A loop repeats instructions.', check: 'Check the repeat count.' }, question: 'Why does a coding loop need a count?' };
async function fixture(run, provider) {
  const server = createGateway({ token, model: 'qwen3.5:2b' }, provider);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/byte/generate`;
  const send = (body = data, auth = token) => fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try { await run(send); } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test('gateway rejects weak configuration, unauthenticated clients and arbitrary payloads', async () => {
  assert.throws(() => gatewayConfig({})); assert.throws(() => gatewayConfig({ BYTE_GATEWAY_TOKEN: token, BYTE_MODEL: 'arbitrary' }));
  let calls = 0;
  await fixture(async send => {
    assert.equal((await send(data, 'wrong')).status, 401);
    assert.equal((await send({ ...data, messages: [] })).status, 400);
    assert.equal((await send({ ...data, question: 'x'.repeat(5000) })).status, 400);
    assert.equal(calls, 0);
  }, async () => { calls++; throw new Error('must not call'); });
});
test('gateway fixes model, local endpoint, no tools/history/streaming and bounded output', async () => {
  await fixture(async send => { assert.deepEqual(await (await send()).json(), { inScope: true, answer: 'A loop repeats instructions.' }); }, async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/chat'); assert.equal(options.redirect, 'error');
    const body = JSON.parse(options.body); assert.equal(body.model, 'qwen3.5:2b'); assert.equal(body.messages.length, 2); assert.equal(body.stream, false); assert.equal(body.think, false); assert.equal(body.tools, undefined); assert.equal(body.options.num_ctx, 2048);
    return Response.json({ message: { content: JSON.stringify({ inScope: true, answer: 'A loop repeats instructions.' }) } });
  });
  await fixture(async send => { assert.equal((await send()).status, 503); }, async () => new Response('x'.repeat(17000)));
  await fixture(async send => { const response = await send(); assert.equal(response.status, 503); assert.equal((await response.text()).includes('sensitive'), false); }, async () => { throw new Error('sensitive'); });
});
test('gateway admits only one generation at a time and enforces its global cap', async () => {
  let finish, started;
  const begins = new Promise(resolve => { started = resolve; });
  const model = new Promise(resolve => { finish = resolve; });
  await fixture(async send => {
    const first = send(); await begins;
    assert.equal((await send()).status, 503);
    finish(Response.json({ message: { content: JSON.stringify({ inScope: true, answer: 'A loop repeats instructions.' }) } }));
    assert.equal((await first).status, 200);
    for (let i = 0; i < 4; i++) assert.equal((await send({ ...data, topic: 'invalid' })).status, 400);
    assert.equal((await send()).status, 429);
  }, async () => { started(); return model; });
});
