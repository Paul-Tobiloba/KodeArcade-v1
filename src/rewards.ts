/** No speed penalty. Early exploration keeps full stars; completion always earns one. */
export function challengeStars(attempts: number, hints: number, guided = false): number {
  const attemptStars = attempts <= 2 ? 5 : attempts <= 4 ? 4 : attempts <= 7 ? 3 : attempts <= 11 ? 2 : 1;
  const hintCap = hints <= 1 ? 5 : hints === 2 ? 4 : hints === 3 ? 3 : 2;
  return guided ? 1 : Math.max(1, Math.min(attemptStars, hintCap));
}

export const rewardRules = 'Completed runs 1–2: 5 stars; 3–4: 4; 5–7: 3; 8–11: 2; 12 or more: 1. The first hint keeps 5 available; hints 2, 3 and 4 cap the reward at 4, 3 and 2. A guided solution earns 1. No time penalty. Completing a challenge always earns at least one star. Saved best stars never decrease.';
