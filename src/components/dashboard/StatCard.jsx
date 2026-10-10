import { Link } from 'react-router-dom';

export default function StatCard({ icon: Icon, label, value, hint, to, children }) {
  const body = (
    <div className="card h-full p-4 transition-colors hover:border-mute/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-mute">{label}</span>
        <Icon className="h-4 w-4 text-mute" aria-hidden />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
      {children}
    </div>
  );
  return to ? (
    <Link to={to} className="block rounded-xl">
      {body}
    </Link>
  ) : (
    body
  );
}
