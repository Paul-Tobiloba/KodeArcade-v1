# Ask Byte: approved help first, private AI evaluation second

## What ships

The learning guide includes **Ask Byte** on movement and drawing activities. Children select one of three questions: topic explanation, activity goal or structural program check. Responses are authored locally; no model, chat endpoint, student name or program is involved. Checks identify empty/disconnected programs, floating blocks, empty Repeat bodies, missing required loops and block budgets. Text checks are limited reminders, not a full compiler analysis. Existing progressive hints and their star rules remain the only route clues.

The **adult-only private lab** is at `/#/byte-lab`, linked from adult Account & security. It is disabled by default and rejected for learner sessions on the server, including direct API requests. Enabling the pilot never enables student AI. There is deliberately no learner free-text input.

## Private development setup (not yet performed on the VPS)

Do not change n8n, its compose project, Traefik routing or Ollama's loopback binding. No ports need to be opened in the firewall. The standalone gateway uses Node 22+ and has no npm dependencies. Review `scripts/byte-gateway.mjs`, copy that file to a separate VPS directory and run it with a dedicated unprivileged OS account. It binds only `127.0.0.1:11435` and calls Ollama only at `127.0.0.1:11434`.

1. Generate a separate random gateway token locally: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Keep it private; do not paste it into chat or commit it.
2. Supply that value as `BYTE_GATEWAY_TOKEN` to the gateway process. Set `BYTE_MODEL=qwen3.5:2b` (or `qwen3.5:4b` for comparison). Start with `node byte-gateway.mjs`. Use a protected environment file/service credential rather than putting secrets in shell commands/history. For persistent use, create a restricted systemd service separately; that is not automatically installed by this repository.
3. From the development computer, forward the gateway using SSH: `ssh -N -L 127.0.0.1:11435:127.0.0.1:11435 YOUR_SSH_USER@YOUR_VPS`. Prefer a non-root SSH account and key authentication. This is a development tunnel, not a Vercel deployment solution.
4. In the **server-only**, gitignored local `.env`, set:

   ```dotenv
   BYTE_PILOT_ENABLED=true
   BYTE_GATEWAY_URL=http://127.0.0.1:11435
   BYTE_GATEWAY_TOKEN=YOUR_PRIVATE_RANDOM_TOKEN
   BYTE_PILOT_ADULT_IDS=YOUR_VERIFIED_ADULT_AUTH_USER_ID
   ```

   The token must match the gateway. Obtain your own adult `user.id` privately from the database using an operator account; check `principal_kind = adult` and email verification. Do not expose a database administration endpoint to retrieve it. Do not add learner IDs. Restart the API after changing configuration.
5. Open Account & security → View private lab status. Choose a coding topic and test an explanation. No call occurs until you submit. The lab displays plain text, supports cancellation and saves no chat history in KodeArcade. Check gateway/OS logging policies separately; do not add prompt/body logging.
6. Return `BYTE_PILOT_ENABLED=false`, restart the API and stop the tunnel/gateway when testing is finished. Existing Ollama Docker CPU/memory caps remain necessary. `ollama stop` unloads a model; it need not be deleted.

Production startup rejects an enabled pilot. Vercel cannot reach this computer's SSH tunnel or the VPS loopback address. A future production deployment needs a separately reviewed private connection or authenticated TLS gateway, model evaluations and child-safety/privacy controls—not a public Ollama port.

## Boundaries and limits

- Verified adult session **and** explicit user-ID allowlist, exact-origin CSRF protection, no-store responses and strict request schema. No client-provided model, URL, history, system prompt, code, learner identity, saved progress, lesson override or tool definitions.
- Only the selected authored topic and an adult's short question are sent to the gateway. No complete challenge solutions or hints are included. The lab tests explanations, not activity-aware tutoring.
- Persisted database budgets: 5 attempts/adult/minute and 40 model requests/hour across API instances. Gateway: one in-flight request, no queue, at most 5 attempts/minute. Authentication and budget failures do not fall back to an unguarded provider.
- Gateway token checked with constant-time comparison. Fixed local Ollama endpoint/model allowlist; redirects forbidden. 4 KB gateway request, 16 KB provider response, 8 KB API response and 900-character answer limits. 45-second provider/API deadlines. No retries, external tools, browsing or code execution.
- Cancellation immediately discards a late answer in the browser and forwards abort signals where the HTTP adapter supports them. It is best-effort downstream; do not assume clicking Cancel instantly unloads the model or releases its resources.
- Conservative scope/privacy/injection filters before generation and response checks after it. **These are prototype heuristics, not proof of child safety.** Clever off-topic prompts, personal details and wrong explanations can evade them. This is why free-text AI remains inaccessible to children regardless of testing outcome in this release.
- Qwen performance observed by the user on the capped 2-vCPU VPS was roughly 10 seconds warm for 2B and 12 seconds warm for 4B. Cold loads take longer. This is not a classroom concurrency benchmark. No remote load test or n8n isolation guarantee has been made.

## Checks before any future student AI pilot

Evaluate representative coding misconceptions by grade, unsafe/off-topic questions, obfuscated prompt injection, personal-data requests, route-solution leakage, multilingual input and misleading responses. Have educators review accuracy and reading level. Measure p95 latency and n8n health under controlled load; add operational monitoring without collecting children's chat bodies. Define adult consent, retention, escalation, incident handling and a kill switch. A passing unit-test suite is not sufficient approval.

## Verification commands

```text
npm test
npm run check:server
npm run test:server
node --test scripts/byte-gateway.test.mjs
npx playwright test e2e/byte.spec.ts
npm run build
```

Automated model responses use synthetic fixtures. Live Qwen/gateway integration must be checked after the private VPS setup; it is not claimed by those tests.

Protocol references: [Ollama chat API](https://docs.ollama.com/api/chat), [Ollama deployment FAQ](https://docs.ollama.com/faq), [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/).
