import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Timer, CalendarPlus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ColorDot } from '../components/ui/Badge';
import { Field } from '../components/ui/Field';
import SessionForm from '../components/planning/SessionForm';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';
import { useStats } from '../hooks/useStats';
import { addDaysISO, formatDate, formatMinutes, relativeDay, startOfWeekISO, todayISO } from '../utils/dates';

function GoalInput({ id, label, value, onCommit, hint }) {
  const [v, setV] = useState(String(value ?? ''));
  const commit = () => {
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 10080) {
      setV(String(value ?? ''));
      return;
    }
    if (n !== Number(value)) onCommit(Math.round(n));
  };
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type="number"
          min="0"
          inputMode="numeric"
          className="field pr-12"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-mute">min</span>
      </div>
    </Field>
  );
}

export default function Planning() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const stats = useStats();
  const [form, setForm] = useState(null); // { mode, initial }
  const [deleting, setDeleting] = useState(null); // { kind, item }
  const { settings } = state;

  const weekSessions = state.sessions.filter((s) => s.date >= stats.weekStart && s.date <= stats.weekEnd);
  const weekPlans = state.plans.filter((p) => p.date >= stats.weekStart && p.date <= stats.weekEnd);

  const perCourse = useMemo(
    () =>
      state.courses.map((c) => {
        const done = weekSessions.filter((s) => s.courseId === c.id).reduce((a, s) => a + Number(s.duration || 0), 0);
        const planned = weekPlans.filter((p) => p.courseId === c.id).reduce((a, p) => a + Number(p.plannedMin || 0), 0);
        const goal = Number(settings.courseGoals?.[c.id]) || 0;
        const total = state.sessions.filter((s) => s.courseId === c.id).reduce((a, s) => a + Number(s.duration || 0), 0);
        return { course: c, done, planned, goal, total };
      }),
    [state.courses, state.sessions, weekSessions, weekPlans, settings.courseGoals]
  );

  const upcomingPlans = state.plans.filter((p) => p.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const recent = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const courseOf = (id) => state.courses.find((c) => c.id === id);
  const setGoal = (changes) => {
    dispatch({ type: 'SETTINGS_UPDATE', changes });
    toast.success('Meta atualizada.');
  };

  return (
    <>
      <PageHeader
        title="Planejamento"
        subtitle={`Semana de ${formatDate(stats.weekStart, { day: '2-digit', month: 'short' })} a ${formatDate(stats.weekEnd, { day: '2-digit', month: 'short' })}`}
        actions={
          <>
            <button className="btn-ghost" onClick={() => setForm({ mode: 'plan' })} disabled={!state.courses.length}>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Planejar estudo
            </button>
            <button className="btn-primary" onClick={() => setForm({ mode: 'session' })} disabled={!state.courses.length}>
              <Plus className="h-4 w-4" aria-hidden /> Registrar sessão
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Metas e comparação */}
          <section className="card p-5 sm:p-6" aria-labelledby="goals">
            <h2 id="goals" className="mb-4 text-sm font-semibold">
              Metas de estudo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <GoalInput id="g-day" label="Meta diária" value={settings.dailyGoalMin} onCommit={(n) => setGoal({ dailyGoalMin: n })} hint="Use 0 para não definir meta." />
              <GoalInput id="g-week" label="Meta semanal" value={settings.weeklyGoalMin} onCommit={(n) => setGoal({ weeklyGoalMin: n })} hint="Use 0 para não definir meta." />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-mute">Hoje</span>
                  <span className="tabular-nums">
                    {formatMinutes(stats.minutesToday)}
                    {settings.dailyGoalMin > 0 && ` / ${formatMinutes(settings.dailyGoalMin)}`}
                  </span>
                </div>
                <ProgressBar value={settings.dailyGoalMin ? (stats.minutesToday / settings.dailyGoalMin) * 100 : 0} label="Progresso da meta diária" />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-mute">Semana</span>
                  <span className="tabular-nums">
                    {formatMinutes(stats.minutesWeek)}
                    {settings.weeklyGoalMin > 0 && ` / ${formatMinutes(settings.weeklyGoalMin)}`}
                  </span>
                </div>
                <ProgressBar value={settings.weeklyGoalMin ? (stats.minutesWeek / settings.weeklyGoalMin) * 100 : 0} color="#4E9F7D" label="Progresso da meta semanal" />
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="by-course">
            <div className="mb-1 flex items-center justify-between">
              <h2 id="by-course" className="text-sm font-semibold">
                Planejado x realizado por curso
              </h2>
              <span className="text-xs text-mute">Esta semana</span>
            </div>
            <p className="mb-4 text-xs text-mute">
              Total planejado: {formatMinutes(stats.plannedWeek)} · Realizado: {formatMinutes(stats.minutesWeek)}
            </p>
            {state.courses.length === 0 ? (
              <p className="py-6 text-center text-sm text-mute">Cadastre um curso para planejar seus estudos.</p>
            ) : (
              <ul className="divide-y divide-line">
                {perCourse.map(({ course, done, planned, goal, total }) => {
                  const ref = planned || goal;
                  return (
                    <li key={course.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <Link to={`/cursos/${course.id}`} className="flex min-w-0 items-center gap-2 text-sm font-medium hover:underline">
                          <ColorDot color={course.color} />
                          <span className="truncate">{course.name}</span>
                        </Link>
                        <span className="text-xs tabular-nums text-mute">Total acumulado: {formatMinutes(total)}</span>
                      </div>
                      <ProgressBar value={ref ? (done / ref) * 100 : done ? 100 : 0} color={course.color} label={`Realizado em ${course.name}`} />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-mute">
                        <span className="tabular-nums">
                          Realizado {formatMinutes(done)} · Planejado {formatMinutes(planned)}
                          {goal > 0 && ` · Meta ${formatMinutes(goal)}`}
                        </span>
                        <label className="flex items-center gap-2">
                          Meta semanal do curso
                          <input
                            type="number"
                            min="0"
                            className="field w-20 py-1 text-xs"
                            defaultValue={goal || ''}
                            placeholder="min"
                            aria-label={`Meta semanal de ${course.name} em minutos`}
                            onBlur={(e) => {
                              const n = Math.max(0, Math.round(Number(e.target.value) || 0));
                              if (n !== goal) {
                                dispatch({ type: 'SETTINGS_UPDATE', changes: { courseGoals: { ...settings.courseGoals, [course.id]: n } } });
                                toast.success('Meta do curso atualizada.');
                              }
                            }}
                          />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5" aria-labelledby="plans">
            <h2 id="plans" className="mb-1 text-sm font-semibold">
              Estudos planejados
            </h2>
            {upcomingPlans.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarPlus className="mx-auto mb-2 h-5 w-5 text-mute" aria-hidden />
                <p className="text-sm text-mute">Nenhum estudo planejado.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {upcomingPlans.map((p) => {
                  const c = courseOf(p.courseId);
                  return (
                    <li key={p.id} className="flex items-start gap-3 py-3">
                      <ColorDot color={c?.color} className="mt-1.5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c?.name}</p>
                        <p className="text-[11px] text-mute">
                          {relativeDay(p.date)} · {formatMinutes(p.plannedMin)}
                        </p>
                        {p.content && <p className="mt-1 line-clamp-2 text-xs text-mute">{p.content}</p>}
                      </div>
                      <button className="icon-btn h-8 w-8 hover:text-rose-300" aria-label="Excluir bloco planejado" onClick={() => setDeleting({ kind: 'plan', item: p })}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card p-5" aria-labelledby="recent">
            <div className="mb-1 flex items-center justify-between">
              <h2 id="recent" className="text-sm font-semibold">
                Sessões recentes
              </h2>
              <Link to="/historico" className="text-xs text-accent hover:underline">
                Histórico
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState icon={Timer} title="Nenhuma sessão registrada" description="Registre o tempo estudado para acompanhar suas metas." />
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((s) => {
                  const c = courseOf(s.courseId);
                  return (
                    <li key={s.id} className="flex items-start gap-3 py-3">
                      <ColorDot color={c?.color} className="mt-1.5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c?.name}</p>
                        <p className="text-[11px] text-mute">
                          {formatDate(s.date)} · {formatMinutes(s.duration)}
                        </p>
                        {s.content && <p className="mt-1 line-clamp-2 text-xs text-mute">{s.content}</p>}
                      </div>
                      <button className="icon-btn h-8 w-8" aria-label="Editar sessão" onClick={() => setForm({ mode: 'session', initial: s })}>
                        <Pencil className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {form && (
        <SessionForm
          key={form.initial?.id || form.mode}
          open
          mode={form.mode}
          initial={form.initial}
          onClose={() => setForm(null)}
          onSubmit={(data) => {
            if (form.mode === 'plan') {
              dispatch({ type: 'PLAN_ADD', plan: data });
              toast.success('Estudo planejado.');
            } else if (form.initial) {
              dispatch({ type: 'SESSION_UPDATE', id: form.initial.id, changes: data });
              toast.success('Sessão atualizada.');
            } else {
              dispatch({ type: 'SESSION_ADD', session: data });
              toast.success('Sessão de estudo registrada.');
            }
            setForm(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir bloco planejado"
        message="Deseja excluir este estudo planejado? Esta ação não pode ser desfeita."
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          dispatch({ type: 'PLAN_DELETE', id: deleting.item.id });
          toast.success('Bloco planejado excluído.');
          setDeleting(null);
        }}
      />
    </>
  );
}
