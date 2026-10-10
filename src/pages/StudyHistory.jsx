import { useMemo, useState } from 'react';
import { History, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ColorDot } from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import SessionForm from '../components/planning/SessionForm';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';
import { useCourseMap } from '../hooks/useStats';
import { addDaysISO, formatDate, formatMinutes, todayISO } from '../utils/dates';

const PERIODS = {
  '': 'Todo o período',
  '7': 'Últimos 7 dias',
  '30': 'Últimos 30 dias',
  '90': 'Últimos 90 dias',
};

export default function StudyHistory() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const courseMap = useCourseMap();
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [form, setForm] = useState(null); // 'new' | session
  const [deleting, setDeleting] = useState(null);

  const list = useMemo(() => {
    const min = period ? addDaysISO(todayISO(), -Number(period)) : '';
    return state.sessions
      .filter((s) => (!course || s.courseId === course) && (!min || s.date >= min))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.sessions, course, period]);

  const total = list.reduce((a, s) => a + Number(s.duration || 0), 0);
  const days = new Set(list.map((s) => s.date)).size;

  return (
    <>
      <PageHeader
        title="Histórico de estudos"
        subtitle="Todas as sessões de estudo registradas."
        actions={
          <button className="btn-primary" onClick={() => setForm('new')} disabled={!state.courses.length}>
            <Plus className="h-4 w-4" aria-hidden /> Registrar sessão
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Select aria-label="Filtrar por curso" value={course} onChange={(e) => setCourse(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
          <option value="">Todos os cursos</option>
          {state.courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Filtrar por período" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: 'auto' }}>
          {Object.entries(PERIODS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <p className="ml-auto text-xs text-mute">
          {list.length} {list.length === 1 ? 'sessão' : 'sessões'} · {formatMinutes(total)} em {days} {days === 1 ? 'dia' : 'dias'}
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma sessão encontrada"
          description={state.sessions.length ? 'Não há sessões para os filtros selecionados.' : 'Registre sessões de estudo para construir seu histórico.'}
          action={
            !state.sessions.length && (
              <button className="btn-primary" onClick={() => setForm('new')} disabled={!state.courses.length}>
                <Plus className="h-4 w-4" aria-hidden /> Registrar sessão
              </button>
            )
          }
        />
      ) : (
        <div className="card divide-y divide-line">
          {list.map((s) => {
            const c = courseMap[s.courseId];
            return (
              <div key={s.id} className="group flex items-start gap-4 px-4 py-4">
                <div className="w-20 shrink-0 text-xs text-mute">{formatDate(s.date, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ColorDot color={c?.color} />
                    <span className="truncate">{c?.name || 'Curso removido'}</span>
                  </p>
                  {s.content && <p className="mt-1 whitespace-pre-wrap text-xs text-mute">{s.content}</p>}
                </div>
                <span className="shrink-0 text-sm tabular-nums">{formatMinutes(s.duration)}</span>
                <div className="flex shrink-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button className="icon-btn h-8 w-8" aria-label="Editar sessão" onClick={() => setForm(s)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="icon-btn h-8 w-8 hover:text-rose-300" aria-label="Excluir sessão" onClick={() => setDeleting(s)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <SessionForm
          key={form === 'new' ? 'new' : form.id}
          open
          initial={form === 'new' ? null : form}
          defaultCourseId={course}
          onClose={() => setForm(null)}
          onSubmit={(data) => {
            if (form === 'new') {
              dispatch({ type: 'SESSION_ADD', session: data });
              toast.success('Sessão de estudo registrada.');
            } else {
              dispatch({ type: 'SESSION_UPDATE', id: form.id, changes: data });
              toast.success('Sessão atualizada.');
            }
            setForm(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir sessão"
        message="Deseja excluir esta sessão de estudo? Esta ação não pode ser desfeita."
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          dispatch({ type: 'SESSION_DELETE', id: deleting.id });
          toast.success('Sessão excluída.');
          setDeleting(null);
        }}
      />
    </>
  );
}
