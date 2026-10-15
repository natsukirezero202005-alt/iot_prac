import { getQuestionsForMode } from '../utils/quiz';

const CARDS = {
  practice: {
    kicker: 'PRACTICE MODE',
    title: 'MCQ Practice',
    lines: () => [`${getQuestionsForMode('practice').length} questions`, 'Pick one answer per question'],
    cta: 'Start Practice',
  },
  hard: {
    kicker: 'HARD MODE',
    title: 'MCQ + Fill in the Blank',
    lines: () => ['More challenging practice'],
    cta: 'Start Hard Mode',
  },
};

// One big tappable card per practice mode.
export default function ModeCard({ mode, onStart }) {
  const card = CARDS[mode];
  return (
    <button type="button" className={`mode-card mode-card--${mode}`} onClick={() => onStart(mode)}>
      <span className="mode-card__kicker">{card.kicker}</span>
      <span className="mode-card__title">{card.title}</span>
      <span className="mode-card__lines">
        {card.lines().map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      <span className="mode-card__cta">{card.cta}</span>
    </button>
  );
}
