import { useEffect, useRef } from 'react';

// Submit confirmation using the native <dialog> (focus trap + Esc handled by the browser).
export default function ConfirmDialog({ open, unanswered, marked, busy, onCancel, onConfirm }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="confirm" aria-labelledby="confirm-title" onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }}>
      <h2 id="confirm-title" className="confirm__title">Are you sure you want to submit?</h2>
      <p className="confirm__text">
        {unanswered > 0
          ? `You still have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}.`
          : 'You have answered every question.'}
      </p>
      {marked > 0 && (
        <p className="confirm__text">{marked} {marked === 1 ? 'question is' : 'questions are'} marked for review.</p>
      )}
      <div className="confirm__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={onConfirm} disabled={busy}>
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </dialog>
  );
}
