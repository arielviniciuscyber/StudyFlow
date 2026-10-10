export default function ProgressBar({ value = 0, color = '#2A9DA8', height = 'h-1.5', label }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-line/70 ${height}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progresso'}
    >
      <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}
