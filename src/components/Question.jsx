// Renders one question. MCQ = radio buttons (value is the option index).
// Fill in the blank = text box (value is the typed string).
export default function Question({ question, value, onChange }) {
  const isFill = question.type === 'fill';
  const answered = isFill ? String(value ?? '').trim() !== '' : Number.isInteger(value);

  return (
    <article className="question">
      <p className="question__meta">
        Week {question.week} · Assignment question {question.number}
      </p>

      {isFill ? (
        <div className="question__fill">
          <label htmlFor={`fill-${question.id}`} className="question__text">
            {question.question}
          </label>
          <input
            id={`fill-${question.id}`}
            className="fill-input"
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      ) : (
        <fieldset className="question__options">
          <legend className="question__text">{question.question}</legend>
          {question.options.map((option, index) => {
            const inputId = `q${question.id}-o${index}`;
            return (
              <div key={inputId} className="option">
                <input
                  id={inputId}
                  className="option__input"
                  type="radio"
                  name={`q-${question.id}`}
                  checked={value === index}
                  onChange={() => onChange(index)}
                />
                <label htmlFor={inputId} className="option__label">
                  <span className="option__letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option__text">{option}</span>
                </label>
              </div>
            );
          })}
        </fieldset>
      )}

      {answered && (
        <button type="button" className="link-button" onClick={() => onChange(isFill ? '' : null)}>
          Clear answer
        </button>
      )}
    </article>
  );
}
