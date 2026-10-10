import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle2, ListChecks, CalendarClock, TrendingUp, Plus, Timer } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ProgressBar from '../components/ui/ProgressBar';
import StatCard from '../components/dashboard/StatCard';
import UpcomingList from '../components/dashboard/UpcomingList';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import CourseFilters, { DEFAULT_FILTERS, applyCourseFilters } from '../components/courses/CourseFilters';
import TaskRow from '../components/tasks/TaskRow';
import { useStats, useCourseMap } from '../hooks/useStats';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';
import { useTaskActions } from '../hooks/useTaskActions';
import { formatMinutes } from '../utils/dates';

export default function Dashboard() {
  const stats = useStats();
  const courseMap = useCourseMap();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const taskActions = useTaskActions();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [creating, setCreating] = useState(false);

  const list = applyCourseFilters(stats.courses, filters);
  const hasFilters = filters.q || filters.institution || filters.category || filters.status || filters.progress;
  const focusTasks = [...stats.overdueTasks, ...stats.dueSoonTasks.filter((t) => !stats.overdueTasks.includes(t))]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const dailyGoal = Number(state.settings.dailyGoalMin) || 0;
  const weeklyGoal = Number(state.settings.weeklyGoalMin) || 0;

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Resumo dos seus estudos, calculado a partir dos dados cadastrados."
        actions={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Novo curso
          </button>
        }
      />

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={BookOpen} label="Cursos cadastrados" value={stats.total} to="/cursos" />
        <StatCard icon={PlayCircle} label="Em andamento" value={stats.inProgress} />
        <StatCard icon={CheckCircle2} label="Concluídos" value={stats.done} />
        <StatCard
          icon={ListChecks}
          label="Tarefas pendentes"
          value={stats.pendingTasks.length}
          hint={stats.overdueTasks.length ? `${stats.overdueTasks.length} em atraso` : 'Nenhuma em atraso'}
          to="/tarefas"
        />
        <StatCard
          icon={CalendarClock}
          label="Próximos compromissos"
          value={stats.upcomingEvents.length}
          to="/calendario"
        />
        <StatCard icon={TrendingUp} label="Progresso geral" value={`${stats.overall}%`}>
          <div className="mt-3">
            <ProgressBar value={stats.overall} label="Progresso geral dos estudos" />
          </div>
        </StatCard>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="sec-courses">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="sec-courses" className="text-base font-semibold">
              Cursos
            </h2>
            <Link to="/cursos" className="text-xs text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          <CourseFilters courses={stats.courses} filters={filters} onChange={setFilters} />
          {list.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={hasFilters ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'}
              description={
                hasFilters ? 'Ajuste os filtros para ver outros cursos.' : 'Cadastre um curso para começar.'
              }
              action={
                !hasFilters && (
                  <button className="btn-primary" onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4" aria-hidden /> Novo curso
                  </button>
                )
              }
            />
          ) : (
            <div className={filters.view === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-3'}>
              {list.map((c) => (
                <CourseCard key={c.id} course={c} view={filters.view} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card p-5" aria-labelledby="sec-today">
            <h2 id="sec-today" className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Timer className="h-4 w-4 text-mute" aria-hidden /> Estudo de hoje
            </h2>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-mute">Meta diária</span>
                  <span className="tabular-nums">
                    {formatMinutes(stats.minutesToday)}
                    {dailyGoal > 0 && ` / ${formatMinutes(dailyGoal)}`}
                  </span>
                </div>
                <ProgressBar value={dailyGoal ? (stats.minutesToday / dailyGoal) * 100 : 0} label="Meta diária" />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-mute">Meta semanal</span>
                  <span className="tabular-nums">
                    {formatMinutes(stats.minutesWeek)}
                    {weeklyGoal > 0 && ` / ${formatMinutes(weeklyGoal)}`}
                  </span>
                </div>
                <ProgressBar
                  value={weeklyGoal ? (stats.minutesWeek / weeklyGoal) * 100 : 0}
                  color="#4E9F7D"
                  label="Meta semanal"
                />
              </div>
            </div>
            <Link to="/planejamento" className="mt-4 inline-block text-xs text-accent hover:underline">
              Registrar sessão de estudo
            </Link>
          </section>

          <section className="card p-5" aria-labelledby="sec-next">
            <div className="mb-1 flex items-center justify-between">
              <h2 id="sec-next" className="text-sm font-semibold">
                Próximos compromissos
              </h2>
              <Link to="/calendario" className="text-xs text-accent hover:underline">
                Calendário
              </Link>
            </div>
            <UpcomingList events={stats.upcomingEvents} limit={5} />
          </section>

          <section className="card p-3" aria-labelledby="sec-tasks">
            <div className="flex items-center justify-between px-2 pb-1 pt-2">
              <h2 id="sec-tasks" className="text-sm font-semibold">
                Tarefas em foco
              </h2>
              <Link to="/tarefas" className="text-xs text-accent hover:underline">
                Ver todas
              </Link>
            </div>
            {focusTasks.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-mute">Sem tarefas atrasadas ou próximas do prazo.</p>
            ) : (
              focusTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  course={courseMap[t.courseId]}
                  onToggle={taskActions.toggle}
                  onEdit={taskActions.openEdit}
                  onDelete={taskActions.askDelete}
                />
              ))
            )}
          </section>
        </aside>
      </div>

      {taskActions.modals}
      {creating && (
        <CourseForm
          open
          categories={state.courses.map((c) => c.category)}
          onClose={() => setCreating(false)}
          onSubmit={(data) => {
            dispatch({ type: 'COURSE_ADD', course: data });
            setCreating(false);
            toast.success('Curso cadastrado com sucesso.');
          }}
        />
      )}
    </>
  );
}
