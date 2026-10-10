import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { ColorDot } from '../ui/Badge';
import { EVENT_TYPES } from '../../utils/constants';
import { formatDate, relativeDay } from '../../utils/dates';
import { useCourseMap } from '../../hooks/useStats';

export default function UpcomingList({ events, limit = 6, onSelect, emptyText = 'Nenhum compromisso agendado.' }) {
  const courses = useCourseMap();
  const items = events.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CalendarDays className="mb-2 h-5 w-5 text-mute" aria-hidden />
        <p className="text-sm text-mute">{emptyText}</p>
        <Link to="/calendario" className="mt-2 text-xs text-accent hover:underline">
          Abrir calendário
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((e) => {
        const c = courses[e.courseId];
        const Wrapper = onSelect ? 'button' : 'div';
        return (
          <li key={e.id}>
            <Wrapper
              {...(onSelect ? { onClick: () => onSelect(e) } : {})}
              className="flex w-full items-start gap-3 py-3 text-left"
            >
              <div className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-line bg-surface py-1">
                <span className="text-[10px] uppercase text-mute">
                  {formatDate(e.date, { month: 'short' }).replace('.', '')}
                </span>
                <span className="text-sm font-semibold leading-tight">{e.date.slice(8)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-mute">
                  {c && (
                    <span className="inline-flex items-center gap-1.5">
                      <ColorDot color={c.color} />
                      <span className="max-w-[140px] truncate">{c.name}</span>
                    </span>
                  )}
                  <span>{EVENT_TYPES[e.type] || 'Atividade'}</span>
                  <span>
                    {relativeDay(e.date)}
                    {e.time ? ` · ${e.time}` : ''}
                  </span>
                </p>
              </div>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
}
