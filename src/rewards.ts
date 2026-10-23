import { practiceRewardRules, practiceStars } from '../shared/codingPractice';

/** Called only on successful completion. Keep the legacy call signature readable. */
export function challengeStars(_attempts: number, _hints: number, _guided = false): number { return practiceStars; }
export const rewardRules = practiceRewardRules;
