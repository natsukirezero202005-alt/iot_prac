// Question palette. Each button shows its state with shape + text label, not colour alone:
//  answered = filled, current = thick outline, marked = corner flag.
export default function QuestionNavigator({ items, currentIndex, onJump }) {
  return (
    <div className="navigator">
      <ul className="navigator__legend" aria-label="Legend">
        <li><span className="swatch swatch--unanswered" aria-hidden="true" /> Unanswered</li>
        <li><span className="swatch swatch--answered" aria-hidden="true" /> Answered</li>
        <li><span className="swatch swatch--marked" aria-hidden="true" /> Marked for review</li>
        <li><span className="swatch swatch--current" aria-hidden="true" /> Current</li>
      </ul>

      <div className="navigator__grid" role="group" aria-label="Jump to question">
        {items.map((item, index) => {
          const parts = [`Question ${index + 1}`, item.answered ? 'answered' : 'unanswered'];
          if (item.marked) parts.push('marked for review');
          if (index === currentIndex) parts.push('current question');
          const classes = ['nav-btn'];
          if (item.answered) classes.push('is-answered');
          if (item.marked) classes.push('is-marked');
          if (index === currentIndex) classes.push('is-current');
          return (
            <button
              key={item.id}
              type="button"
              className={classes.join(' ')}
              aria-label={parts.join(', ')}
              aria-current={index === currentIndex ? 'true' : undefined}
              onClick={() => onJump(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
