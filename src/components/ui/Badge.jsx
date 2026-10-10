export default function Badge({ tone = 'text-mute border-line', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tone} ${className}`}>
      {children}
    </span>
  );
}

export function ColorDot({ color, className = '' }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`} style={{ background: color }} aria-hidden />;
}
