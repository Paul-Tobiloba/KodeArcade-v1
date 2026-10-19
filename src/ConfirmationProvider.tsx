import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './confirmation.css';

export type ConfirmationOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'standard';
  notice?: boolean;
};
export type ConfirmAction = (options: ConfirmationOptions) => Promise<boolean>;
type Pending = ConfirmationOptions & { owner?: string; resolve: (accepted: boolean) => void };
type Service = { request: (options: ConfirmationOptions, owner?: string) => Promise<boolean>; cancel: (owner: string) => void };
const ConfirmationContext = createContext<Service | null>(null);
let editorConfirmation: ConfirmAction | undefined;

// Blockly's callback API cannot use React hooks. Fail closed outside the app host.
export const confirmEditorAction: ConfirmAction = options => editorConfirmation?.(options) ?? Promise.resolve(false);

export function useConfirmation(): ConfirmAction {
  const service = useContext(ConfirmationContext);
  const owner = useId();
  useEffect(() => () => service?.cancel(owner), [service, owner]);
  const confirm = useCallback((options: ConfirmationOptions) => service?.request(options, owner) ?? Promise.resolve(false), [service, owner]);
  return confirm;
}

export default function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const current = useRef<Pending | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const safeAction = useRef<HTMLButtonElement>(null);
  const titleId = useId(), descriptionId = useId();
  const finish = useCallback((accepted: boolean) => {
    const request = current.current;
    if (!request) return;
    current.current = null;
    dialog.current?.close();
    setPending(null);
    request.resolve(accepted);
  }, []);
  const [service] = useState<Service>(() => ({
    request: (options, owner) => {
      // A second click must not enqueue a second destructive operation.
      if (current.current) return Promise.resolve(false);
      return new Promise<boolean>(resolve => {
        const request = { ...options, owner, resolve };
        current.current = request;
        setPending(request);
      });
    },
    cancel: owner => { if (current.current?.owner === owner) finish(false); },
  }));
  useEffect(() => {
    const request: ConfirmAction = options => service.request(options);
    editorConfirmation = request;
    const dismiss = () => finish(false);
    addEventListener('hashchange', dismiss);
    addEventListener('pagehide', dismiss);
    return () => {
      if (editorConfirmation === request) editorConfirmation = undefined;
      removeEventListener('hashchange', dismiss);
      removeEventListener('pagehide', dismiss);
      const abandoned = current.current;
      current.current = null;
      abandoned?.resolve(false);
    };
  }, [service, finish]);
  useEffect(() => {
    if (!pending || current.current !== pending) return;
    dialog.current?.showModal();
    safeAction.current?.focus();
  }, [pending]);
  return <ConfirmationContext.Provider value={service}>{children}{createPortal(
    <dialog ref={dialog} className="confirmation-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); finish(false); }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
      {pending && <>
        <div className="confirmation-heading"><h2 id={titleId}>{pending.title}</h2><button type="button" className="confirmation-close" aria-label="Close confirmation" onClick={() => finish(false)}><X size={21} /></button></div>
        <p id={descriptionId}>{pending.message}</p>
        <div className="confirmation-actions">
          {!pending.notice && <button ref={safeAction} type="button" className="confirmation-cancel" onClick={() => finish(false)}>{pending.cancelLabel ?? 'Cancel'}</button>}
          <button ref={pending.notice ? safeAction : undefined} type="button" className={`confirmation-accept ${pending.tone === 'danger' ? 'confirmation-danger' : ''}`} onClick={() => finish(true)}>{pending.confirmLabel}</button>
        </div>
      </>}
    </dialog>, document.body,
  )}</ConfirmationContext.Provider>;
}
