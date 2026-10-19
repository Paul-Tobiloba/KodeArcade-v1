import { useEffect, useState } from 'react';
import type { SaveStatus } from './cloudProgress';
import './save-feedback.css';

export type SaveFeedbackProps = {
  status: SaveStatus;
  recoveryStatus?: 'writing' | 'protected' | 'unavailable';
  recoveryNotice?: string;
  retry: () => void;
  download: () => void;
  reload?: () => void;
};

export default function SaveFeedback({ status, recoveryStatus, recoveryNotice, retry, download, reload }: SaveFeedbackProps) {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(false);
    if (status !== 'saved') return;
    const timer = setTimeout(() => setDismissed(true), 3000);
    return () => clearTimeout(timer);
  }, [status]);
  const routine = status === 'saved' || status === 'saving' || status === 'pending';
  const hidden = status === 'saved' && dismissed;
  const message = status === 'saved' ? 'Saved to your account'
    : status === 'saving' ? 'Saving your work…'
      : status === 'pending' ? 'Changes waiting to save…'
        : status === 'conflict' ? 'Another tab saved newer work. Your changes have not overwritten it.'
          : recoveryStatus === 'protected' ? 'Not synced yet. An encrypted recovery copy is saved on this device. Reconnect to sync.'
            : 'Work has not saved. Keep this tab open and check your connection.';
  return <div className={`save-feedback-slot${routine ? ' save-feedback-routine' : ''}`}>
    <div className={`student-cloud-status${hidden ? ' save-feedback-hidden' : ''}`} role="status" aria-atomic="true" aria-hidden={hidden || undefined}>
      <span><span>{message}</span>{recoveryNotice && status !== 'saved' && <small>{recoveryNotice}</small>}{status !== 'saved' && recoveryStatus === 'unavailable' && <small>Device recovery is unavailable. Download your work before closing.</small>}</span>
      {status === 'error' && <button type="button" onClick={retry}>Retry save</button>}
      {(status === 'conflict' || status === 'error') && <button type="button" onClick={download}>Download unsaved work</button>}
      {status === 'conflict' && <button type="button" onClick={reload}>Reload saved version</button>}
    </div>
  </div>;
}
