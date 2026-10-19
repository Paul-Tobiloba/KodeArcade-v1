import { afterEach, describe, expect, it, vi } from 'vitest';
import { activateStudentStorage, activityStorage, clearStudentStorage } from './activityStorage';
const publicStorage = { getItem: vi.fn(() => 'public-draft'), setItem: vi.fn(), removeItem: vi.fn() };
afterEach(() => { clearStudentStorage(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('shared-computer student draft boundary', () => {
  it('never imports public saves into a student activity', () => {
    vi.stubGlobal('location', { hash: '#/student-play/grade-2' }); vi.stubGlobal('localStorage', publicStorage);
    expect(activityStorage.getItem('draft')).toBeNull();
    activateStudentStorage('pupil-a:class-a'); activityStorage.setItem('draft', 'student-a');
    expect(activityStorage.getItem('draft')).toBe('student-a'); expect(publicStorage.getItem).not.toHaveBeenCalled(); expect(publicStorage.setItem).not.toHaveBeenCalled();
  });
  it('clears drafts on learner or classroom changes and sign-out', () => {
    vi.stubGlobal('location', { hash: '#/student-play/grade-2' });
    activateStudentStorage('pupil-a:class-a'); activityStorage.setItem('draft', 'student-a');
    activateStudentStorage('pupil-b:class-a'); expect(activityStorage.getItem('draft')).toBeNull();
    activityStorage.setItem('draft', 'student-b'); activateStudentStorage('pupil-b:class-b'); expect(activityStorage.getItem('draft')).toBeNull();
    activityStorage.setItem('draft', 'work'); clearStudentStorage(); expect(activityStorage.getItem('draft')).toBeNull();
  });
  it('preserves the public-preview save behavior outside student activity routes', () => {
    vi.stubGlobal('location', { hash: '#/learn/grade-2' }); vi.stubGlobal('localStorage', publicStorage);
    expect(activityStorage.getItem('draft')).toBe('public-draft'); activityStorage.setItem('draft', 'public-work'); expect(publicStorage.setItem).toHaveBeenCalledWith('draft', 'public-work');
  });
});
