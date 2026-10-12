# Ask Byte: approved help first, private AI evaluation second

## What ships

The learning guide includes **Ask Byte** on movement and drawing activities. Children select one of three questions: topic explanation, activity goal or structural program check. Responses are authored locally; no model, chat endpoint, student name or program is involved. Checks identify empty/disconnected programs, floating blocks, empty Repeat bodies, missing required loops and block budgets. Text checks are limited reminders, not a full compiler analysis. Existing progressive hints and their star rules remain the only route clues.

The **adult-only private lab** is at `/#/byte-lab`, linked from adult Account & security. It is disabled by default and rejected for learner sessions on the server, including direct API requests. Enabling the pilot never enables student AI. There is deliberately no learner free-text input.

## Private development setup

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

### VPS without Node: separate Docker pilot

Use `deploy/byte-gateway.compose.yml` as a **separate** Compose project, never inside the n8n project. Upload it as `compose.yml` alongside `scripts/byte-gateway.mjs` and `scripts/prepare-byte-pilot.sh` to a private directory owned by a dedicated, non-admin SSH user. Run the preparation script as that user. It creates a random token in a mode-600 `gateway.env`, records the user's UID/GID in `.env`, validates Compose configuration without starting a container, and never prints credentials. Repeated preparation preserves both files and the token. Do not commit or share either generated file.

The administrator can then start only this project:

```sh
docker compose --env-file /home/bytepilot/kodearcade-byte-pilot/.env --project-directory /home/bytepilot/kodearcade-byte-pilot -f /home/bytepilot/kodearcade-byte-pilot/compose.yml up -d --wait
```

This pulls `node:22-alpine` if needed; it does not install host Node, restart n8n, alter Ollama or edit Traefik/firewall settings. The image tag is not immutable: record the resolved image digest after startup, and deliberately review future updates. The gateway runs as the dedicated user's UID/GID, with a read-only filesystem and bind mounts, all capabilities dropped, no-new-privileges, 128 MiB RAM/no swap, 0.25 CPU and 64 PIDs. The token is read from a protected mounted file rather than Docker's configured environment. Logs are rotated and contain no prompt bodies. Restart is intentionally disabled for the development pilot, so a VPS reboot requires an administrator to start it again.

Linux host networking is necessary here to reach Ollama's existing loopback binding. **It does not provide network isolation from host services.** The gateway code fixes its sole provider URL and binds its listener to `127.0.0.1:11435`; it has no Docker socket mount, host filesystem mount beyond its two read-only files, or public port mapping. Do not change the listener to `0.0.0.0`. Verify `ss -ltn` after startup and expect an unauthenticated HTTP request to return 401. The health check does the same without invoking the model. Existing Ollama CPU/memory caps remain separate and essential; gateway limits do not guarantee n8n performance.

Privately transfer `gateway.env` back over the verified SSH connection, then copy its token into the server-only local configuration. Never paste it in chat or use it as a command-line argument. Use a dedicated SSH key outside the repository; verify the host fingerprint through the provider's web console first. A key can have `restrict,port-forwarding,permitopen="127.0.0.1:11435"` authorized-key options; it needs neither sudo nor Docker-group membership. Retain strict host-key checking and bind the local tunnel explicitly to loopback, with `ExitOnForwardFailure=yes`. This key still permits commands as its non-admin account, so protect it and revoke it after the pilot.

To stop only the gateway, the administrator can run:

```sh
docker compose --env-file /home/bytepilot/kodearcade-byte-pilot/.env --project-directory /home/bytepilot/kodearcade-byte-pilot -f /home/bytepilot/kodearcade-byte-pilot/compose.yml stop gateway
```

Stop the development SSH tunnel and disable the local pilot separately. Do not run `docker compose down` from the n8n directory or delete Ollama models/volumes. Container support is preparation, not evidence of a live connection or successful model evaluation.

### Opt-in local launch without editing secrets into .env

After privately transferring `gateway.env` outside the repository, run:

```text
node scripts/start-byte-pilot.mjs /PRIVATE/PATH/gateway.env YOUR_VERIFIED_ADULT_USER_ID
```

This launcher loads existing `.env` configuration, reads only the small gateway credential file, enables the pilot for exactly one supplied adult ID in that process, fixes its gateway URL to the loopback tunnel and starts the normal API. It rejects production and Vercel environments. It does not edit `.env` or persist the token/allowlist. Stop any previous API process first to avoid a port conflict. The normal `npm run dev:server` remains AI-off when the underlying `.env` has no pilot setting. Existing server checks still require a verified adult session and reject learners, even when a learner ID is mistakenly supplied. The launcher does not create sessions or bypass sign-in.

An optional serial smoke check sends four fixed synthetic questions (loops, sequence, ELSE and an off-topic dinner question) through the private gateway:

```text
node --import tsx scripts/evaluate-byte-gateway.ts /PRIVATE/PATH/gateway.env
node --test scripts/start-byte-pilot.test.mjs scripts/byte-gateway.test.mjs
```

It stops on the first failed response, prints timings and synthetic answers, and writes no result/history file. These four checks are not a child-safety evaluation or classroom load test. Check the signed-in browser → application API → gateway → Qwen → rendered answer separately. Do not replay real student work for testing.

### Known pilot limitation: cold model startup

The October 12 live check reached the private VPS gateway, but two cold requests exceeded its 45-second deadline and returned 503. After a separate no-prompt preload, the four synthetic checks passed. Cold readiness is **not** resolved. Do not raise resource caps, extend request deadlines or leave the model resident indefinitely to conceal this limitation.

For a supervised test, an operator can preload the existing model on the VPS immediately before submitting a question:

```sh
curl --max-time 90 -sS http://127.0.0.1:11434/api/generate -H 'Content-Type: application/json' -d '{"model":"qwen3.5:2b","keep_alive":"2m","stream":false,"options":{"num_ctx":2048}}'
```

This generates no explanation and loads the model for a short idle window. It still consumes resources under the existing Ollama caps. The gateway also requests a two-minute keep-alive; another cold start may occur after idle time. Preloading is an operator step for this adult development pilot, not an unattended deployment solution. See [live verification evidence](ASK_BYTE_LIVE_VERIFICATION.md) and the [Ollama preload/keep-alive documentation](https://docs.ollama.com/faq).

References: [Docker Compose service controls](https://docs.docker.com/reference/compose-file/services/), [Linux host networking](https://docs.docker.com/engine/network/drivers/host/), [Node environment-file loading](https://nodejs.org/api/cli.html#--env-filefile).

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
