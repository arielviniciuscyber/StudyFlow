import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Plus, ListChecks, BookOpen } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import CourseForm from '../components/courses/CourseForm';
import ModulesPanel from '../components/courses/ModulesPanel';
import NotesPanel from '../components/courses/NotesPanel';
import TaskRow from '../components/tasks/TaskRow';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';
import { useTaskActions } from '../hooks/useTaskActions';
import { COURSE_STATUS } from '../utils/constants';
import { autoProgress, courseProgress } from '../utils/progress';
import { formatDate, formatDateTime, formatMinutes } from '../utils/dates';

const TABS = [
  ['geral', 'Informações'],
  ['modulos', 'Módulos e aulas'],
  ['anotacoes', 'Anotações'],
  ['tarefas', 'Tarefas'],
];

function InfoItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm">{children || <span className="text-mute">Não informado</span>}</dd>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const taskActions = useTaskActions({ defaultCourseId: courseId });
  const [tab, setTab] = useState('geral');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const course = state.courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Curso não encontrado"
        description="Este curso não existe ou foi excluído."
        action={
          <Link to="/cursos" className="btn-primary">
            Voltar para meus cursos
          </Link>
        }
      />
    );
  }

  const progress = courseProgress(course);
  const auto = autoProgress(course);
  const st = COURSE_STATUS[course.status];
  const tasks = state.tasks
    .filter((t) => t.courseId === course.id)
    .sort((a, b) => (a.status === 'concluida') - (b.status === 'concluida') || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  const minutes = state.sessions.filter((s) => s.courseId === course.id).reduce((s, x) => s + (Number(x.duration) || 0), 0);
  const totalModules = course.modules.length;
  const doneModules = course.modules.filter((m) => (m.lessons?.length ? m.lessons.every((l) => l.done) : m.done)).length;

  const update = (changes) => dispatch({ type: 'COURSE_UPDATE', id: course.id, changes });

  return (
    <>
      <Link to="/cursos" className="mb-4 inline-flex items-center gap-1.5 text-xs text-mute transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Meus cursos
      </Link>

      {/* Cabeçalho do curso */}
      <section className="card mb-6 overflow-hidden">
        <div className="h-1" style={{ background: course.color }} aria-hidden />
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone={st.tone}>{st.label}</Badge>
              <span className="chip">{course.category}</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{course.name}</h1>
            <p className="mt-1 text-sm text-mute">{course.institution}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {course.url ? (
              <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Acessar plataforma <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Cadastrar link da plataforma
              </button>
            )}
            <button className="btn-ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" aria-hidden /> Editar
            </button>
            <button className="btn-ghost hover:text-rose-300" onClick={() => setDeleting(true)} aria-label="Excluir curso">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-line bg-surface/40 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-mute">Progresso geral</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <ProgressBar value={progress} color={course.color} height="h-2" label="Progresso do curso" />
            <p className="mt-2 text-[11px] text-mute">
              {course.progressMode === 'manual'
                ? 'Progresso ajustado manualmente.'
                : totalModules
                ? `Calculado a partir dos módulos cadastrados (${doneModules} de ${totalModules} concluídos).`
                : 'Cadastre módulos para calcular o progresso automaticamente.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="status-quick" className="text-xs text-mute">
              Status
            </label>
            <Select
              id="status-quick"
              value={course.status}
              onChange={(e) => {
                update({ status: e.target.value });
                toast.success('Status atualizado.');
              }}
              style={{ width: 'auto' }}
            >
              {Object.entries(COURSE_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {/* Abas */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Seções do curso">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key ? 'border-accent text-ink' : 'border-transparent text-mute hover:text-ink'
            }`}
          >
            {label}
            {key === 'tarefas' && tasks.length > 0 && <span className="ml-2 text-xs text-mute">{tasks.filter((t) => t.status !== 'concluida').length}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="animate-fadeIn">
        {tab === 'geral' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="card space-y-6 p-5 sm:p-6">
              <dl className="space-y-6">
                <InfoItem label="Objetivo">{course.objective}</InfoItem>
                <InfoItem label="Descrição do conteúdo">{course.description}</InfoItem>
                <InfoItem label="O que o curso ensina e conhecimentos que posso desenvolver">{course.learns}</InfoItem>
              </dl>
              {!course.learns && (
                <p className="rounded-lg border border-dashed border-line px-4 py-3 text-xs text-mute">
                  As informações oficiais (conteúdo, carga horária e certificado) não foram preenchidas. Use "Editar" para
                  complementar com os dados reais do curso.
                </p>
              )}
            </section>

            <aside className="space-y-6">
              <section className="card p-5">
                <h2 className="mb-4 text-sm font-semibold">Detalhes</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <InfoItem label="Instituição">{course.institution}</InfoItem>
                  <InfoItem label="Área">{course.area}</InfoItem>
                  <InfoItem label="Início">{course.startDate && formatDate(course.startDate)}</InfoItem>
                  <InfoItem label="Previsão de conclusão">{course.endDate && formatDate(course.endDate)}</InfoItem>
                  <InfoItem label="Carga horária">{course.workload}</InfoItem>
                  <InfoItem label="Tempo estudado">{minutes ? formatMinutes(minutes) : ''}</InfoItem>
                  <InfoItem label="Próxima atividade">{course.nextActivity}</InfoItem>
                  <InfoItem label="Última atualização">{formatDateTime(course.updatedAt)}</InfoItem>
                </dl>
              </section>

              <section className="card p-5">
                <h2 className="mb-3 text-sm font-semibold">Ajuste de progresso</h2>
                <div className="space-y-3 text-sm">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="pmode"
                      className="mt-1 accent-[#2A9DA8]"
                      checked={course.progressMode !== 'manual'}
                      onChange={() => update({ progressMode: 'auto' })}
                    />
                    <span>
                      Automático
                      <span className="block text-xs text-mute">
                        {auto === null ? 'Disponível após cadastrar módulos.' : `Calculado: ${auto}%`}
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="pmode"
                      className="mt-1 accent-[#2A9DA8]"
                      checked={course.progressMode === 'manual'}
                      onChange={() => update({ progressMode: 'manual', manualProgress: course.manualProgress || progress })}
                    />
                    <span>Manual</span>
                  </label>
                  {course.progressMode === 'manual' && (
                    <div className="flex items-center gap-3 pl-7">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={course.manualProgress ?? 0}
                        onChange={(e) => update({ manualProgress: Number(e.target.value) })}
                        className="flex-1 accent-[#2A9DA8]"
                        aria-label="Progresso manual"
                      />
                      <span className="w-10 text-right text-xs tabular-nums">{course.manualProgress ?? 0}%</span>
                    </div>
                  )}
                  {auto === null && course.progressMode !== 'manual' && (
                    <div className="flex items-center gap-3 pl-7">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={course.manualProgress ?? 0}
                        onChange={(e) => update({ manualProgress: Number(e.target.value) })}
                        className="flex-1 accent-[#2A9DA8]"
                        aria-label="Progresso sem módulos"
                      />
                      <span className="w-10 text-right text-xs tabular-nums">{course.manualProgress ?? 0}%</span>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}

        {tab === 'modulos' && <ModulesPanel course={course} color={course.color} />}

        {tab === 'anotacoes' && <NotesPanel key={course.id} course={course} />}

        {tab === 'tarefas' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-mute">{tasks.length === 0 ? 'Nenhuma tarefa neste curso.' : `${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`}</p>
              <button className="btn-primary" onClick={taskActions.openNew}>
                <Plus className="h-4 w-4" aria-hidden /> Nova tarefa
              </button>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Sem tarefas por aqui"
                description="Crie tarefas com prazo e prioridade para organizar as atividades deste curso."
                action={
                  <button className="btn-primary" onClick={taskActions.openNew}>
                    <Plus className="h-4 w-4" aria-hidden /> Criar tarefa
                  </button>
                }
              />
            ) : (
              <div className="card divide-y divide-line p-2">
                {tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    course={course}
                    showCourse={false}
                    onToggle={taskActions.toggle}
                    onEdit={taskActions.openEdit}
                    onDelete={taskActions.askDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {taskActions.modals}

      {editing && (
        <CourseForm
          open
          initial={course}
          categories={state.courses.map((c) => c.category)}
          onClose={() => setEditing(false)}
          onSubmit={(data) => {
            update(data);
            setEditing(false);
            toast.success('Curso atualizado.');
          }}
        />
      )}

      <ConfirmDialog
        open={deleting}
        title="Excluir curso"
        message={`Deseja excluir "${course.name}"? Módulos, anotações, tarefas, eventos e sessões de estudo deste curso também serão removidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir curso"
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          dispatch({ type: 'COURSE_DELETE', id: course.id });
          toast.success('Curso excluído.');
          navigate('/cursos');
        }}
      />
    </>
  );
}
