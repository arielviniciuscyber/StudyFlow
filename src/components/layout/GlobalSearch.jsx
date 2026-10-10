import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ListChecks, CalendarDays } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/dates';

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function GlobalSearch() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const dq = useDebounce(q, 150);

  useEffect(() => {
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const results = useMemo(() => {
    const t = norm(dq.trim());
    if (!t) return null;
    const hit = (...f) => f.some((x) => norm(x || '').includes(t));
    return {
      courses: state.courses.filter((c) => hit(c.name, c.institution, c.category, c.area)).slice(0, 5),
      tasks: state.tasks.filter((x) => hit(x.title, x.description)).slice(0, 5),
      events: state.events.filter((x) => hit(x.title, x.description)).slice(0, 5),
    };
  }, [dq, state]);

  const go = (path) => {
    setOpen(false);
    setQ('');
    navigate(path);
  };

  const empty = results && !results.courses.length && !results.tasks.length && !results.events.length;

  const Item = ({ icon: Icon, title, meta, onClick }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-card">
      <Icon className="h-4 w-4 shrink-0 text-mute" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{title}</span>
        {meta && <span className="block truncate text-[11px] text-mute">{meta}</span>}
      </span>
    </button>
  );

  const Group = ({ label, children }) => (
    <div className="py-1">
      <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-mute">{label}</p>
      {children}
    </div>
  );

  return (
    <div ref={ref} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        type="search"
        placeholder="Buscar cursos, tarefas e eventos"
        aria-label="Busca global"
        className="field pl-9 pr-12"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-[10px] text-mute sm:block">
        Ctrl K
      </kbd>

      {open && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] animate-fadeIn overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-soft">
          {empty && <p className="px-4 py-6 text-center text-sm text-mute">Nenhum resultado para "{dq}".</p>}
          {results.courses.length > 0 && (
            <Group label="Cursos">
              {results.courses.map((c) => (
                <Item key={c.id} icon={BookOpen} title={c.name} meta={c.institution} onClick={() => go(`/cursos/${c.id}`)} />
              ))}
            </Group>
          )}
          {results.tasks.length > 0 && (
            <Group label="Tarefas">
              {results.tasks.map((t) => (
                <Item
                  key={t.id}
                  icon={ListChecks}
                  title={t.title}
                  meta={t.dueDate ? `Vence em ${formatDate(t.dueDate)}` : 'Sem prazo'}
                  onClick={() => go(`/tarefas?q=${encodeURIComponent(t.title)}`)}
                />
              ))}
            </Group>
          )}
          {results.events.length > 0 && (
            <Group label="Eventos">
              {results.events.map((e) => (
                <Item key={e.id} icon={CalendarDays} title={e.title} meta={formatDate(e.date)} onClick={() => go(`/calendario?data=${e.date}`)} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}
