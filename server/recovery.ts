import { createHmac } from 'node:crypto';
import { curriculumVersion } from '../shared/progress.js';
export function recoveryOwner(secret: string, learnerId: string, classroomId: string, credentialVersion: number) {
  return createHmac('sha256', secret).update(JSON.stringify(['recovery-owner-v1', learnerId, classroomId, credentialVersion])).digest('base64url');
}
export function recoveryAccess(secret: string, learnerId: string, classroomId: string, credentialVersion: number, course: string) {
  const owner = recoveryOwner(secret, learnerId, classroomId, credentialVersion);
  const derive = (purpose: string) => createHmac('sha256', secret).update(JSON.stringify([purpose, owner, course, curriculumVersion])).digest('base64url');
  return { owner, key: derive('recovery-key-v1'), slot: derive('recovery-slot-v1') };
}
