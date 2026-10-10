import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, ListChecks } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Select } from '../components/ui/Field';
import TaskRow from '../components/tasks/TaskRow';
import { useStore } from '../hooks/useStore';
import { useCourseMap, isOverdue, isDueSoon } from '../hooks/useStats';
import { useTaskActions } from '../hooks/useTaskActions';
import { PRIORITY, TASK_STATUS } from '../utils/constants';

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Tasks() {
  const { state } = useStore();
  const courseMap = useCourseMap();
  const actions = useTaskActions();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('due');

  const onQ = (v) => {
    setQ(v);
    if (params.get('q')) setParams({}, { replace: true });
  };

  const sorter = useMemo(() => {
    const byDue = (a, b) => (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
    return {
      due: byDue,
      priority: (a, b) => PRIORITY[b.priority].order - PRIORITY[a.priority].order || byDue(a, b),
      course: (a, b) =>
        (courseMap[a.courseId]?.name || '').localeCompare(courseMap[b.courseId]?.name || '', 'pt-BR') || byDue(a, b),
      status: (a, b) => a.status.localeCompare(b.status) || byDue(a, b),
    }[sort];
  }, [sort, courseMap]);

  const filtered = useMemo(() => {
    const t = norm(q.trim());
    return state.tasks
      .filter((x) => (!t || norm(`${x.title} ${x.description}`).includes(t)) && (!course || x.courseId === course) && (!status || x.status === status) && (!priority || x.priority === priority))
      .sort(sorter);
  }, [state.tasks, q, course, status, priority, sorter]);

  const open = filtered.filter((t) => t.status !== 'concluida');
  const overdue = open.filter((t) => isOverdue(t));
  const soon = open.filter((t) => !isOverdue(t) && isDueSoon(t));
  const rest = open.filter((t) => !isOverdue(t) && !isDueSoon(t));
  const done = filtered.filter((t) => t.status === 'concluida');

  const hasFilters = q || course || status || priority;

  const Section = ({ title, hint, list }) =>
    list.length === 0 ? null : (
      <section className="mb-6">
        <div className="mb-2 flex items-baseline gap-2 px-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className="text-xs text-mute">{list.length}</span>
          {hint && <span className="hidden text-xs text-mute sm:inline">· {hint}</span>}
        </div>
        <div className="card divide-y divide-line p-1.5">
          {list.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              course={courseMap[t.courseId]}
              onToggle={actions.toggle}
              onEdit={actions.openEdit}
              onDelete={actions.askDelete}
            />
          ))}
        </div>
      </section>
    );

  return (
    <>
      <PageHeader
        title="Tarefas"
        subtitle={`${state.tasks.filter((t) => t.status !== 'concluida').length} pendentes de ${state.tasks.length} cadastradas`}
        actions={
          <button className="btn-primary" onClick={actions.openNew} disabled={state.courses.length === 0}>
            <Plus className="h-4 w-4" aria-hidden /> Nova tarefa
          </button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(4,auto)]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
          <input type="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder="Pesquisar tarefas" aria-label="Pesquisar tarefas" className="field pl-9" />
        </div>
        <Select aria-label="Filtrar por curso" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">Todos os cursos</option>
          {state.courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(TASK_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filtrar por prioridade" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Todas as prioridades</option>
          {Object.entries(PRIORITY).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Ordenar tarefas" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="due">Ordenar por prazo</option>
          <option value="priority">Ordenar por prioridade</option>
          <option value="course">Ordenar por curso</option>
          <option value="status">Ordenar por status</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={hasFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa cadastrada'}
          description={
            hasFilters
              ? 'Ajuste a pesquisa ou os filtros.'
              : 'Crie tarefas vinculadas aos seus cursos para acompanhar prazos e prioridades.'
          }
          action={
            hasFilters ? (
              <button
                className="btn-ghost"
                onClick={() => {
                  setQ('');
                  setCourse('');
                  setStatus('');
                  setPriority('');
                }}
              >
                Limpar filtros
              </button>
            ) : (
              <button className="btn-primary" onClick={actions.openNew}>
                <Plus className="h-4 w-4" aria-hidden /> Nova tarefa
              </button>
            )
          }
        />
      ) : (
        <>
          <Section title="Atrasadas" list={overdue} hint="prazo anterior a hoje" />
          <Section title="Próximas do vencimento" list={soon} hint="nos próximos 7 dias" />
          <Section title="Demais pendentes" list={rest} />
          <Section title="Concluídas" list={done} />
        </>
      )}

      {actions.modals}
    </>
  );
}
