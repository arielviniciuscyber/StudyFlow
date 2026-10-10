import { buildMonthGrid, WEEKDAYS, todayISO } from '../../utils/dates';

const MAX_VISIBLE = 2;

export default function MonthGrid({ year, month, itemsByDate, courseMap, onSelectDate }) {
  const cells = buildMonthGrid(year, month);
  const today = todayISO();

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-7 border-b border-line bg-surface text-center text-[11px] font-medium uppercase tracking-wide text-mute">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-card">
        {cells.map((cell, i) => {
          const items = itemsByDate[cell.iso] || [];
          const isToday = cell.iso === today;
          const extra = items.length - MAX_VISIBLE;
          return (
            <button
              key={cell.iso}
              onClick={() => onSelectDate(cell.iso)}
              aria-label={`${cell.day} — ${items.length} ${items.length === 1 ? 'atividade' : 'atividades'}`}
              className={`group relative flex min-h-[64px] flex-col items-stretch gap-1 border-line p-1.5 text-left transition-colors hover:bg-surface sm:min-h-[104px] sm:p-2 ${
                i % 7 !== 6 ? 'border-r' : ''
              } ${i < 35 ? 'border-b' : ''} ${cell.inMonth ? '' : 'bg-bg/40'}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center self-start rounded-full text-xs tabular-nums ${
                  isToday ? 'bg-accent font-semibold text-white' : cell.inMonth ? 'text-ink' : 'text-mute/50'
                }`}
              >
                {cell.day}
              </span>

              {/* Desktop: chips resumidos */}
              <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                {items.slice(0, MAX_VISIBLE).map((it) => {
                  const c = courseMap[it.courseId];
                  return (
                    <span
                      key={it.key}
                      className={`flex min-w-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] ${
                        it.done ? 'opacity-50' : ''
                      }`}
                      style={{ background: `${c?.color || '#6E7F96'}22`, color: '#E7EDF5' }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c?.color || '#6E7F96' }} />
                      <span className={`truncate ${it.done ? 'line-through' : ''}`}>
                        {it.kind === 'task' ? 'Prazo: ' : ''}
                        {it.title}
                      </span>
                    </span>
                  );
                })}
                {extra > 0 && <span className="px-1.5 text-[11px] text-mute">+{extra} mais</span>}
              </div>

              {/* Mobile: pontos */}
              <div className="flex flex-wrap gap-0.5 sm:hidden">
                {items.slice(0, 4).map((it) => (
                  <span
                    key={it.key}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: courseMap[it.courseId]?.color || '#6E7F96' }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
