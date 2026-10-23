import { z } from 'zod';

/** Practice is achievement, not a claim of independently assessed understanding. */
export const codingPractice = z.object({ version: z.literal(1), complete: z.literal(true), supportUsed: z.boolean() }).strict();
export type CodingPractice = z.infer<typeof codingPractice>;
export const practiceStars = 5;
export const practiceRewardRules = 'A completed coding or drawing practice earns 5 stars. Attempts, hints, examples and extra time never reduce them. Repeating an activity does not add duplicate stars. Previously earned stars stay unchanged until you complete that activity again. Stars celebrate practice; independent mastery is assessed separately.';
export function completePractice(previous: CodingPractice | undefined, supportUsed: boolean): CodingPractice {
  return { version: 1, complete: true, supportUsed: Boolean(previous?.supportUsed || supportUsed) };
}
export function readPractice(value: unknown): CodingPractice | undefined {
  const parsed = codingPractice.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
