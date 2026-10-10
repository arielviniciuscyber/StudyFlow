import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ListChecks, CalendarDays } from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import { formatDate, relativeDay } from '../../utils/dates';

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const stats = useStats();

  useEffect(() => {
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const todayEvents = stats.upcomingEvents.filter((e) => e.date === stats.today);
  const items = [
    ...stats.overdueTasks.slice(0, 4).map((t) => ({
      key: t.id,
      icon: ListChecks,
      title: t.title,
      meta: `Tarefa atrasada · ${relativeDay(t.dueDate)}`,
      to: `/tarefas?q=${encodeURIComponent(t.title)}`,
    })),
    ...todayEvents.slice(0, 4).map((e) => ({
      key: e.id,
      icon: CalendarDays,
      title: e.title,
      meta: `Hoje${e.time ? ` às ${e.time}` : ''}`,
      to: `/calendario?data=${e.date}`,
    })),
    ...stats.dueSoonTasks.slice(0, 3).map((t) => ({
      key: `s-${t.id}`,
      icon: ListChecks,
      title: t.title,
      meta: `Vence em ${formatDate(t.dueDate, { day: '2-digit', month: 'short' })} · ${relativeDay(t.dueDate)}`,
      to: `/tarefas?q=${encodeURIComponent(t.title)}`,
    })),
  ];
  const count = stats.overdueTasks.length + todayEvents.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn relative"
        aria-label={`Notificações${count ? `, ${count} pendentes` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-fadeIn rounded-xl border border-line bg-surface shadow-soft">
          <div className="border-b border-line px-4 py-3 text-sm font-semibold">Notificações</div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mute">Nenhum aviso no momento.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1">
              {items.map(({ key, icon: Icon, title, meta, to }) => (
                <li key={key}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-card"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-mute" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{title}</span>
                      <span className="block text-[11px] text-mute">{meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
