import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import Question from '../components/Question';
import QuestionNavigator from '../components/QuestionNavigator';
import ConfirmDialog from '../components/ConfirmDialog';
import { MODES, evaluate, getQuestionsForMode, isAnswered, normalizeMode } from '../utils/quiz';
import { saveAttempt } from '../firebase/attempts'; // coming in the next phase

// Exam page: clean, no parallax, no timer.
const progressKey = (mode) => `quizhub:progress:${mode}`;
export const RESULT_KEY = 'quizhub:lastResult';

function loadProgress(mode) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(progressKey(mode)));
    if (saved && typeof saved === 'object') return saved;
  } catch {
    /* ignore corrupt data */
  }
  return null;
}

export default function Exam() {
  const [params] = useSearchParams();
  const mode = normalizeMode(params.get('mode'));
  const list = useMemo(() => getQuestionsForMode(mode), [mode]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Progress survives a refresh (same tab) so an accidental reload does not lose answers.
  const [answers, setAnswers] = useState(() => loadProgress(mode)?.answers ?? {});
  const [marked, setMarked] = useState(() => loadProgress(mode)?.marked ?? {});
  const [index, setIndex] = useState(() => Math.min(loadProgress(mode)?.index ?? 0, list.length - 1));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const paletteCloseRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(progressKey(mode), JSON.stringify({ answers, marked, index }));
  }, [mode, answers, marked, index]);

  // Move to the top and close the drawer whenever the question changes.
  useEffect(() => {
    window.scrollTo(0, 0);
    setPaletteOpen(false);
  }, [index]);

  useEffect(() => {
    if (!paletteOpen) return undefined;
    paletteCloseRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setPaletteOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  if (list.length === 0) {
    return (
      <div className="exam exam--empty">
        <p>No questions are available for this mode.</p>
        <Link to="/" className="btn btn--primary">Return Home</Link>
      </div>
    );
  }

  const current = list[index];
  const total = list.length;
  const answeredCount = list.filter((q) => isAnswered(q, answers[q.id])).length;
  const markedCount = list.filter((q) => marked[q.id]).length;
  const unansweredCount = total - answeredCount;
  const navItems = list.map((q) => ({ id: q.id, answered: isAnswered(q, answers[q.id]), marked: Boolean(marked[q.id]) }));

  function setAnswer(value) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === null || value === '') delete next[current.id];
      else next[current.id] = value;
      return next;
    });
  }

  function toggleMark() {
    setMarked((prev) => {
      const next = { ...prev };
      if (next[current.id]) delete next[current.id];
      else next[current.id] = true;
      return next;
    });
  }

  async function submitQuiz() {
    setSubmitting(true);
    const summary = evaluate(list, answers);
    const completedAt = new Date().toISOString();
    let saveFailed = false;
    try {
      await saveAttempt(user.uid, {
        mode,
        score: summary.score,
        total: summary.total,
        percentage: summary.percentage,
        correct: summary.correct,
        incorrect: summary.incorrect,
        unanswered: summary.unanswered,
      });
    } catch {
      saveFailed = true; // still show the result; just tell the student it was not saved
    }
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ mode, answers, completedAt, saveFailed }));
    sessionStorage.removeItem(progressKey(mode));
    navigate('/result', { replace: true });
  }

  return (
    <div className="exam">
      <header className="exam__bar">
        <div className="exam__bar-text">
          <p className="exam__mode">{MODES[mode].label}</p>
          <h1 className="exam__count" aria-live="polite">Question {index + 1} / {total}</h1>
        </div>
        <button
          type="button"
          className="btn btn--secondary exam__palette-btn"
          aria-expanded={paletteOpen}
          aria-controls="palette"
          onClick={() => setPaletteOpen(true)}
        >
          Questions
        </button>
      </header>

      <div className="exam__progress">
        <ProgressBar value={index + 1} max={total} label="Question position" />
        <p className="exam__progress-note">{answeredCount} answered{markedCount > 0 ? ` · ${markedCount} marked` : ''}</p>
      </div>

      <main className="exam__body">
        <Question key={current.id} question={current} value={answers[current.id]} onChange={setAnswer} />

        {paletteOpen && <div className="palette-backdrop" onClick={() => setPaletteOpen(false)} />}
        <aside id="palette" className={`palette${paletteOpen ? ' is-open' : ''}`} aria-label="Question navigator">
          <div className="palette__head">
            <h2>Questions</h2>
            <button ref={paletteCloseRef} type="button" className="btn btn--secondary btn--small palette__close" onClick={() => setPaletteOpen(false)}>
              Close
            </button>
          </div>
          <QuestionNavigator items={navItems} currentIndex={index} onJump={setIndex} />
        </aside>
      </main>

      <footer className="exam__controls">
        <div className="exam__nav-row">
          <button type="button" className="btn btn--secondary" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            Previous
          </button>
          <button type="button" className={`btn btn--secondary${marked[current.id] ? ' is-active' : ''}`} aria-pressed={Boolean(marked[current.id])} onClick={toggleMark}>
            {marked[current.id] ? 'Marked' : 'Mark for Review'}
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setIndex(index + 1)} disabled={index === total - 1}>
            Next
          </button>
        </div>
        <button type="button" className="btn btn--submit btn--block" onClick={() => setConfirmOpen(true)}>
          Submit Quiz
        </button>
      </footer>

      <ConfirmDialog
        open={confirmOpen}
        unanswered={unansweredCount}
        marked={markedCount}
        busy={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submitQuiz}
      />
    </div>
  );
}
