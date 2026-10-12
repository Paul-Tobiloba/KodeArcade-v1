export const accountRoutes = new Set(['family', 'home-login', 'login', 'student-login', 'student-courses', 'adult-login', 'signup', 'check-email', 'email-verified', 'forgot-password', 'reset-password', 'two-factor', 'onboarding', 'dashboard', 'classes', 'classroom', 'class-new', 'learners', 'learner-new', 'account-settings', 'schools', 'school-join']);
export function accountRoute(hash: string) {
  const route = hash.replace(/^#\//, '').split('?')[0];
  return accountRoutes.has(route) ? route : undefined;
}
export function callbackParameter(search: string, hash: string, key: string) {
  return new URLSearchParams(search).get(key) ?? new URLSearchParams(hash.split('?')[1] ?? '').get(key);
}
export type Capabilities = { adultAccounts: boolean; classroomLogin: boolean; classManagement: boolean; learnerManagement: boolean; pdfCards: boolean; cloudProgress: boolean; homeLearning?: boolean };
export type Account = {
  profile: { name: string; email: string; twoFactorEnabled?: boolean };
  workspaces: { id: string; name: string; kind: string; role: string }[];
  classes: { id: string; organizationId?: string; name: string; code: string; grade: number; archivedAt?: string | null }[];
};
export function workspaceHref(route: string, id?: string) {
  return `/#/${route}${id ? `${route.includes('?') ? '&' : '?'}workspace=${encodeURIComponent(id)}` : ''}`;
}
export class AccountError extends Error {
  constructor(public status: number, public code: string) { super('Account request failed'); }
}
export async function accountRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AccountError(0, 'CONNECTION');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new AccountError(response.status, typeof data?.code === 'string' ? data.code : 'REQUEST_FAILED');
  if (!data || typeof data !== 'object') throw new AccountError(0, 'CONNECTION');
  return data as T;
}
export function accountErrorMessage(error: unknown) {
  if (!(error instanceof AccountError)) return 'Something went wrong. Please try again.';
  if (error.status === 0 || error.status >= 500) return 'Cannot reach the account service. Check your connection and try again. The public activity preview is still available.';
  if (error.status === 429) return 'Too many attempts. Please wait before trying again.';
  if (error.code === 'STEP_UP_REQUIRED') return 'Unlock management with your adult password, then try again. The unlock lasts five minutes.';
  if (error.code === 'ALREADY_PROCESSED') return 'This request was already completed. Reload your learners. If the card was lost, reset the password to generate a new card.';
  if (error.code === 'FAMILY_LIMIT') return 'A family can have up to 10 home learners, including paused profiles.';
  if (error.code === 'PROFILE_CONFLICT') return 'This profile changed in another session. Reload the family and review it before saving again.';
  if (error.code === 'DUPLICATE_STUDENT') return 'A student name is already enrolled in this class. Remove that CSV row or use a distinct classroom alias. No students were imported.';
  if (error.code === 'STUDENT_LIMIT') return 'This class can hold 100 students. Reduce the import or use another class.';
  if (error.code === 'DISABLED_STUDENT') return 'Disabled students cannot receive new cards. Select active students only.';
  if (error.code === 'CSV_INVALID') return 'The CSV is not valid. Check its headers, names, grades and password methods against the template.';
  if (error.code === 'ASSIGNMENT_CONFLICT') return 'Assignments changed in another session. Reload the class and review the current courses before saving again.';
  if (error.code === 'CLASS_ARCHIVED') return 'This class is archived. Reload to see its current state. Restore the class before changing students or courses.';
  if (error.code === 'CLASS_STATE_CONFLICT') return 'Class access changed in another session. Reload the class and review its current state before trying again.';
  if (error.code === 'INVITATION_UNAVAILABLE') return 'This invitation is expired, revoked, already used or belongs to another email. Sign in with the invited address or ask the school administrator for a new link.';
  if (error.code === 'ALREADY_MEMBER') return 'This account already belongs to that school. Refresh your workspace list.';
  if (error.code === 'LAST_ADMIN') return 'A school must keep at least one administrator. Add another administrator before changing this access.';
  if (error.code === 'STAFF_CONFLICT') return 'Staff access changed in another session. Reload the school and review the current access before saving again.';
  if (error.code === 'INVALID_STAFF') return 'Choose staff who currently belong to this school. Reload the school before trying again.';
  if (error.code === 'INVITATION_LIMIT' || error.code === 'STAFF_LIMIT') return 'This school has reached its staff or pending invitation limit. Revoke unused invitations or contact support.';
  if (error.code === 'SIGN_OUT_FIRST') return 'An account is already signed in on this computer. Sign out before another student signs in.';
  if (error.code === 'INVALID_STUDENT_LOGIN') return 'Those details did not match. Check the code, username and password method on your card. Use home login for a home card, or student login for a classroom card.';
  if (error.code === 'CLASS_NOT_FOUND') return 'That code was not found here. Check your card and use the right login: home learner or classroom student.';
  if (['PASSWORD_INVALID', 'PASSWORD_OR_MFA_INVALID', 'MFA_REQUIRED'].includes(error.code)) return 'Check your password and, if enabled, your authenticator code.';
  if (error.code === 'EMAIL_NOT_VERIFIED') return 'Verify your email before signing in. Use “Resend verification email” below if you need a new link.';
  if (error.status === 403) return 'This action is not available for these details. During development, email delivery is limited to the configured test inbox.';
  if (error.status === 404) return 'This account feature is not available yet. You can still try a public activity.';
  return 'We could not continue with those details. Check them and try again. Recovery links may have expired.';
}

export async function accountPdf(path: string, body: unknown, signal?: AbortSignal): Promise<Blob> {
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
  catch { throw new AccountError(0, 'CONNECTION'); }
  if (!response.ok) { const data = await response.json().catch(() => null); throw new AccountError(response.status, typeof data?.code === 'string' ? data.code : 'REQUEST_FAILED'); }
  if (!response.headers.get('content-type')?.startsWith('application/pdf')) throw new AccountError(0, 'CONNECTION');
  return response.blob();
}
