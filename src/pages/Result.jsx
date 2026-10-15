import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header';
import ParallaxScene from '../components/ParallaxScene';
import { MODES, evaluate, getQuestionsForMode } from '../utils/quiz';

gsap.registerPlugin(ScrollTrigger);

const RESULT_KEY = 'quizhub:lastResult'; // written by Exam.jsx on submit

function loadResult() {
  try {
    return JSON.parse(sessionStorage.getItem(RESULT_KEY));
  } catch {
    return null;
  }
}

const STATUS_LABEL = {
  correct: '✓ Correct',
  incorrect: '✗ Incorrect',
  unanswered: '– Unanswered',
  unscored: '? No answer key',
};

export default function Result() {
  const stored = useMemo(loadResult, []);
  const storyRef = useRef(null);
  const scoreRef = useRef(null);
  const reviewRef = useRef(null);
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const summary = useMemo(() => {
    if (!stored) return null;
    return evaluate(getQuestionsForMode(stored.mode), stored.answers || {});
  }, [stored]);

  // One reveal per step, plus a count-up on the score. Skipped with reduced motion.
  useLayoutEffect(() => {
    if (!summary) return undefined;
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.utils.toArray('.story-step__inner').forEach((el) => {
          gsap.from(el, { opacity: 0, y: 36, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
        });
        if (scoreRef.current) {
          const counter = { value: 0 };
          ScrollTrigger.create({
            trigger: scoreRef.current,
            start: 'top 80%',
            once: true,
            onEnter: () =>
              gsap.to(counter, {
                value: summary.score,
                duration: 1.2,
                ease: 'power1.out',
                onUpdate: () => {
                  if (scoreRef.current) scoreRef.current.textContent = Math.round(counter.value);
                },
              }),
          });
          scoreRef.current.textContent = '0';
        }
      },
      storyRef,
    );
    return () => mm.revert();
  }, [summary]);

  if (!stored || !summary) return <Navigate to="/" replace />;

  const modeLabel = MODES[stored.mode].label;
  const shown = summary.details.filter((d) => filter === 'all' || d.status === filter);

  function openReview() {
    setReviewOpen(true);
    requestAnimationFrame(() => reviewRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }));
  }

  return (
    <div className="result">
      <div className="result__story" ref={storyRef}>
        <ParallaxScene triggerRef={storyRef} variant="result" />
        <Header variant="scene" />

        <main className="page-content">
          <section className="story-step">
            <div className="story-step__inner">
              <h1 className="story-title">QUIZ COMPLETE</h1>
              <p className="story-sub">{modeLabel}</p>
              <p className="story-hint">Scroll to see your result</p>
            </div>
          </section>

          <section className="story-step" aria-label="Your score">
            <div className="story-step__inner glass">
              <p className="story-label">Your Score</p>
              <p className="story-score">
                <span ref={scoreRef}>{summary.score}</span> / {summary.total}
              </p>
            </div>
          </section>

          <section className="story-step" aria-label="Breakdown">
            <div className="story-step__inner glass">
              <p className="story-percent">{summary.percentage}%</p>
              <dl className="breakdown">
                <div><dt>Correct</dt><dd>{summary.correct}</dd></div>
                <div><dt>Incorrect</dt><dd>{summary.incorrect}</dd></div>
                <div><dt>Unanswered</dt><dd>{summary.unanswered}</dd></div>
              </dl>
              {summary.unscored > 0 && (
                <p className="story-note">{summary.unscored} question has no answer key and is not counted in the score.</p>
              )}
              {stored.saveFailed && (
                <p className="story-note" role="status">This attempt could not be saved to your account.</p>
              )}
            </div>
          </section>

          <section className="story-step" aria-label="Next steps">
            <div className="story-step__inner glass">
              <h2 className="story-closing">Keep practicing.</h2>
              <p className="story-sub">Review your answers and improve.</p>
              <div className="result-actions">
                <button type="button" className="btn btn--primary" onClick={openReview}>Review Answers</button>
                <button type="button" className="btn btn--secondary-light" onClick={() => navigate(`/exam?mode=${stored.mode}`)}>Practice Again</button>
                <button type="button" className="btn btn--secondary-light" onClick={() => navigate('/')}>Return Home</button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {reviewOpen && (
        <section className="review-sheet" ref={reviewRef} aria-labelledby="review-title">
          <div className="review-sheet__inner">
            <h2 id="review-title">Review Answers</h2>
            <div className="chips" role="group" aria-label="Filter answers">
              {[['all', 'All'], ['incorrect', 'Incorrect'], ['unanswered', 'Unanswered']].map(([key, label]) => (
                <button key={key} type="button" className={`chip${filter === key ? ' is-active' : ''}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>
                  {label}
                </button>
              ))}
            </div>

            {shown.length === 0 && <p className="review-empty">Nothing to show for this filter.</p>}

            <ol className="review-list">
              {shown.map((d) => {
                const number = summary.details.indexOf(d) + 1;
                return (
                  <li key={d.question.id} className={`review-item review-item--${d.status}`}>
                    <div className="review-item__head">
                      <span className="review-item__num">Question {number}</span>
                      <span className={`status-pill status-pill--${d.status}`}>{STATUS_LABEL[d.status]}</span>
                    </div>
                    <p className="review-item__q">{d.question.question}</p>
                    <dl className="review-item__answers">
                      <dt>Your answer</dt>
                      <dd>{d.yourAnswer ?? 'Unanswered'}</dd>
                      <dt>Correct answer</dt>
                      <dd>{d.correctAnswer ?? 'Not available in the question data'}</dd>
                    </dl>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
