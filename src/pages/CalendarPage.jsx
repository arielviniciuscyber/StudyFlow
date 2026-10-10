import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MonthGrid from '../components/calendar/MonthGrid';
import DayModal from '../components/calendar/DayModal';
import EventForm from '../components/calendar/EventForm';
import UpcomingList from '../components/dashboard/UpcomingList';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Select } from '../components/ui/Field';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';
import { useStats, useCourseMap } from '../hooks/useStats';
import { monthLabel, parseISO, todayISO } from '../utils/dates';

export default function CalendarPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const courseMap = useCourseMap();
  const stats = useStats();
  const [params, setParams] = useSearchParams();

  const initialDate = params.get('data') && parseISO(params.get('data')) ? params.get('data') : null;
  const base = initialDate ? parseISO(initialDate) : new Date();
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [courseFilter, setCourseFilter] = useState('');
  const [dayOpen, setDayOpen] = useState(initialDate);
  const [form, setForm] = useState(null); // { event?, date? }
  const [deleting, setDeleting] = useState(null);

  const itemsByDate = useMemo(() => {
    const map = {};
    const push = (date, item) => {
      if (!date) return;
      (map[date] ||= []).push(item);
    };
    state.events
      .filter((e) => !courseFilter || e.courseId === courseFilter)
      .forEach((e) =>
        push(e.date, { key: `e-${e.id}`, kind: 'event', title: e.title, courseId: e.courseId, time: e.time, done: e.status === 'concluido', raw: e })
      );
    state.tasks
      .filter((t) => !courseFilter || t.courseId === courseFilter)
      .forEach((t) =>
        push(t.dueDate, { key: `t-${t.id}`, kind: 'task', title: t.title, courseId: t.courseId, time: '', done: t.status === 'concluida', raw: t })
      );
    Object.values(map).forEach((list) => list.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')));
    return map;
  }, [state.events, state.tasks, courseFilter]);

  const go = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const goToday = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const closeDay = () => {
    setDayOpen(null);
    if (params.get('data')) setParams({}, { replace: true });
  };

  const upcoming = stats.upcomingEvents.filter((e) => !courseFilter || e.courseId === courseFilter);

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Provas, simulados, revisões, metas e prazos de tarefas."
        actions={
          <button className="btn-primary" onClick={() => setForm({ date: todayISO() })}>
            <Plus className="h-4 w-4" aria-hidden /> Nova atividade
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Calendário mensal">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="icon-btn border border-line" onClick={() => go(-1)} aria-label="Mês anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="min-w-[160px] text-center text-base font-semibold" aria-live="polite">
                {monthLabel(year, month)}
              </h2>
              <button className="icon-btn border border-line" onClick={() => go(1)} aria-label="Próximo mês">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="btn-ghost ml-1 py-1.5" onClick={goToday}>
                Hoje
              </button>
            </div>
            <Select
              aria-label="Filtrar por curso"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 200 }}
            >
              <option value="">Todos os cursos</option>
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <MonthGrid year={year} month={month} itemsByDate={itemsByDate} courseMap={courseMap} onSelectDate={setDayOpen} />

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda de cursos">
            {state.courses.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-xs text-mute">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} aria-hidden />
                {c.name}
              </li>
            ))}
          </ul>
        </section>

        <aside className="card h-fit p-5">
          <h2 className="mb-1 text-sm font-semibold">Próximos compromissos</h2>
          <UpcomingList
            events={upcoming}
            limit={8}
            onSelect={(e) => {
              const d = parseISO(e.date);
              setYear(d.getFullYear());
              setMonth(d.getMonth());
              setDayOpen(e.date);
            }}
          />
        </aside>
      </div>

      {dayOpen && !form && (
        <DayModal
          date={dayOpen}
          items={itemsByDate[dayOpen] || []}
          courseMap={courseMap}
          onClose={closeDay}
          onAdd={(date) => setForm({ date })}
          onEdit={(event) => setForm({ event })}
          onToggleEvent={(e) => {
            dispatch({ type: 'EVENT_UPDATE', id: e.id, changes: { status: e.status === 'concluido' ? 'pendente' : 'concluido' } });
            toast.success('Status da atividade atualizado.');
          }}
          onOpenTask={(t) => navigate(`/tarefas?q=${encodeURIComponent(t.title)}`)}
        />
      )}

      {form && (
        <EventForm
          key={form.event?.id || `new-${form.date}`}
          open
          initial={form.event}
          defaultDate={form.date}
          defaultCourseId={courseFilter}
          onClose={() => setForm(null)}
          onDelete={(ev) => setDeleting(ev)}
          onSubmit={(data) => {
            if (form.event) {
              dispatch({ type: 'EVENT_UPDATE', id: form.event.id, changes: data });
              toast.success('Atividade atualizada.');
            } else {
              dispatch({ type: 'EVENT_ADD', event: data });
              toast.success('Atividade adicionada ao calendário.');
            }
            const d = parseISO(data.date);
            setYear(d.getFullYear());
            setMonth(d.getMonth());
            setForm(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir atividade"
        message={`Deseja excluir "${deleting?.title}"? Esta ação não pode ser desfeita.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          dispatch({ type: 'EVENT_DELETE', id: deleting.id });
          toast.success('Atividade excluída.');
          setDeleting(null);
          setForm(null);
        }}
      />
    </>
  );
}
