Disposition: ship

## Persistence

This verdict pass scores only the sole P2 recovery finding from `family-finish.md`. The original five-section full review remains the record of the initial review. No app source, design-system file or raster asset was edited by this reviewer.

## Fidelity

The updated `src/StudentCourses.tsx` error view now exposes Try again, Home learner sign in (`/#/home-login`) and Classroom student sign in (`/#/student-login`), with neutral parent/guardian/teacher help. Both recovery paths remain available when the failed request leaves the learning context unknown. This satisfies the original requested repair without requiring stored account intent.

Opened all six targeted `family-recovery-initial-*` and `family-recovery-expired-*` captures at desktop, phone and tablet. They are valid settled recovery states. Both sign-in choices and retry remain readable and reachable; phone stacks the choices without clipping. Reopened all 21 original matrix recaptures for regression checks, including the home login destination and populated child dashboard; no material regression from this fix was observed.

## Ceiling

The exact disposition is `ship` at the scope of the single scored fix. No further fix round is owed for that finding. This is not a new whole-surface review, production certification or security audit. The original documentation handoff still applies.

## Material fixes

| Original finding | Score | Evidence |
| --- | --- | --- |
| P2 — Give home children a working dashboard sign-in recovery | resolved | Source supplies explicit home/classroom destinations and retry. All six new recovery captures show those controls after initial failure and home session expiry. The targeted browser test checks initial 401, retry to the home dashboard, subsequent unauthorized visibility recheck, and navigation to the home login route. Supplied verification: all 18 family browser checks passed across desktop/phone/tablet in 58.9 seconds, and the production build passed after the fix. These checks were not rerun by this reviewer. |

## Keep

Keep the explicit choice of home or classroom login when account context is unavailable, the retry action, neutral help copy, and the existing family/dashboard composition. All earlier Keep recommendations remain applicable.
