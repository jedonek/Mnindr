import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { MSG } from '@/lib/validation';

interface ModalProps {
  title: string;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
}

export function Modal({ title, onClose, children, actions }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, a, input, select')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}

interface UnsavedChangesDialogProps {
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({ onStay, onLeave }: UnsavedChangesDialogProps) {
  return (
    <Modal
      title="Neuložené změny"
      onClose={onStay}
      actions={
        <>
          <Button onClick={onStay}>Zůstat</Button>
          <Button variant="ghost" onClick={onLeave}>
            Odejít bez uložení
          </Button>
        </>
      }
    >
      <p>{MSG.unsaved}</p>
    </Modal>
  );
}
