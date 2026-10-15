// Simple position bar: value / max. Plain CSS, no animation library.
export default function ProgressBar({ value, max, label = 'Progress' }) {
  const percent = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
