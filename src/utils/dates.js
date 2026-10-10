const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

export function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(iso, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  const d = parseISO(iso);
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR', opts).replace('.', '');
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
}

export function formatLongDate(date = new Date()) {
  const s = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function diffDays(isoA, isoB) {
  const a = parseISO(isoA);
  const b = parseISO(isoB);
  return Math.round((a - b) / 86400000);
}

export function addDaysISO(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function startOfWeekISO(iso = todayISO()) {
  const d = parseISO(iso);
  d.setDate(d.getDate() - d.getDay()); // domingo
  return toISO(d);
}

export function relativeDay(iso) {
  if (!iso) return '';
  const n = diffDays(iso, todayISO());
  if (n === 0) return 'Hoje';
  if (n === 1) return 'Amanhã';
  if (n === -1) return 'Ontem';
  if (n > 1) return `Em ${n} dias`;
  return `${Math.abs(n)} dias de atraso`;
}

export function monthLabel(year, month) {
  const s = new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Matriz de dias (6 semanas) para um mês. */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === month });
  }
  return cells;
}

export function formatMinutes(min = 0) {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  if (r === 0) return `${h} h`;
  return `${h} h ${r} min`;
}
