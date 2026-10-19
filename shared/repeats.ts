/** Counts are limited by exact JavaScript integer representation, not lesson difficulty. */
export const validRepeatCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export const repeatCountMessage = 'Use a whole-number repeat count of 0 or more.';
