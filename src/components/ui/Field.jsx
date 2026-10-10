export function Field({ label, error, hint, children, htmlFor, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
      {error && (
        <p className="mt-1 text-[11px] text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ children, ...props }) {
  return (
    <select className="field appearance-none bg-no-repeat pr-8" {...props}>
      {children}
    </select>
  );
}
