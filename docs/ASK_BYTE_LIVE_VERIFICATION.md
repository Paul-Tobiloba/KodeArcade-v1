# Private Byte pilot — live verification, October 12, 2026

Scope: development only, one verified allowlisted adult. Student free-text AI remains disabled; authored learner help is unchanged. No student work, credentials or conversation history was used in these checks.

## Evidence

| Boundary | Observation | Result |
| --- | --- | --- |
| VPS deployment | Separate gateway Compose project reported Healthy | Passed startup, not model readiness |
| Network | Ollama and gateway listened only on loopback; SSH tunnel bound to local loopback | Passed observed configuration |
| Gateway authentication | Unauthenticated request through the tunnel returned 401 | Passed |
| Application API | Local health returned 200; anonymous Byte status returned 401 | Passed |
| Adult identity | Existing database record was verified and adult; only that ID was process-allowlisted | Passed configuration, not a browser login |
| Cold inference | Two requests returned 503 after about 45 seconds | **Failed** |
| Explicit preload | No-prompt Ollama generate request returned 200 in 20.0 seconds | Passed supervised preparation |
| Warm loop question | 200 in 12.6 seconds; instructions run exactly three times | Passed smoke check |
| Warm sequence question | 200 in 17.4 seconds; explanation of instruction order | Passed smoke check |
| Warm ELSE question | 200 in 14.4 seconds; ELSE runs when the condition is false | Passed smoke check |
| Warm off-topic dinner question | 200 in 11.6 seconds; `inScope: false`, empty answer | Passed smoke check |
| n8n health | Existing health endpoint returned 200 before, during and after cold attempts | Passed snapshots only |
| Signed-in adult UI → API → gateway → rendered answer | After normal user sign-in and a separate 5.2-second preload, the page displayed the generated answer: “The instructions run exactly 3 times.” | Passed supervised warm path |

Synthetic answers passed the existing response filter. These checks do not establish broad accuracy, child safety, concurrency capacity or guaranteed n8n isolation. Model: `qwen3.5:2b`, observed Q8_0, Ollama 0.40.3; existing one-CPU/five-GB container caps were not changed. The mutable Node image digest remains to be recorded by an administrator.

## Automated checks

- `npm run check:server`: passed.
- `node --test scripts/start-byte-pilot.test.mjs scripts/byte-gateway.test.mjs`: six tests passed.
- `npm run test:server -- server/byte.test.ts`: nine tests passed, including learner rejection, adult verification/allowlist, request constraints and provider-failure behavior.
- Standalone TypeScript check of `scripts/evaluate-byte-gateway.ts`: passed with strict NodeNext settings.

## Handoff and limits

The SSH tunnel and opt-in local API are development processes; they are not a Vercel connection or durable production service. The launcher does not modify `.env`, create a session or bypass authentication. Stop the pilot process and tunnel to end access; normal API startup remains disabled by default. After a VPS reboot the gateway requires manual startup.

The adult browser test is complete, with a local screenshot of the rendered answer retained outside the repository. Resolve cold-start reliability and complete educator-reviewed evaluations before considering any broader access. Do not enable learners based on these four smoke checks and one supervised browser submission.
