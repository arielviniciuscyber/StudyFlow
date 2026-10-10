import { useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  Layers,
  StickyNote,
} from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import ProgressBar from '../ui/ProgressBar';
import { ModuleForm, LessonForm } from './ModuleForms';
import { useStore } from '../../hooks/useStore';
import { useToast } from '../../hooks/useToast';
import { isModuleDone, moduleUnits } from '../../utils/progress';
import { formatDate } from '../../utils/dates';

function CheckBox({ checked, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={checked}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked ? 'border-accent bg-accent text-white' : 'border-mute/50 hover:border-accent'
      }`}
    >
      {checked && <Check className="h-3.5 w-3.5" aria-hidden />}
    </button>
  );
}

function IconAction({ icon: Icon, label, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`icon-btn h-8 w-8 disabled:opacity-30 ${danger ? 'hover:text-rose-300' : ''}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function ModulesPanel({ course, color }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState({});
  const [moduleForm, setModuleForm] = useState(null); // 'new' | module
  const [lessonForm, setLessonForm] = useState(null); // { moduleId, lesson | null }
  const [confirm, setConfirm] = useState(null); // { kind, module, lesson }

  const cid = course.id;
  const mods = course.modules || [];

  const toggleOpen = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const doDelete = () => {
    if (confirm.kind === 'module') {
      dispatch({ type: 'MODULE_DELETE', courseId: cid, moduleId: confirm.module.id });
      toast.success('Módulo excluído.');
    } else {
      dispatch({ type: 'LESSON_DELETE', courseId: cid, moduleId: confirm.module.id, lessonId: confirm.lesson.id });
      toast.success('Aula excluída.');
    }
    setConfirm(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-mute">
          {mods.length === 0 ? 'Nenhum módulo cadastrado.' : `${mods.length} ${mods.length === 1 ? 'módulo' : 'módulos'}`}
        </p>
        <button className="btn-primary" onClick={() => setModuleForm('new')}>
          <Plus className="h-4 w-4" aria-hidden /> Novo módulo
        </button>
      </div>

      {mods.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum módulo ainda"
          description="Cadastre os módulos e as aulas deste curso. O progresso será calculado automaticamente conforme você concluir cada item."
          action={
            <button className="btn-primary" onClick={() => setModuleForm('new')}>
              <Plus className="h-4 w-4" aria-hidden /> Adicionar primeiro módulo
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {mods.map((m, idx) => {
            const u = moduleUnits(m);
            const done = isModuleDone(m);
            const expanded = open[m.id];
            const pct = Math.round((u.done / u.total) * 100);
            return (
              <li key={m.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="pt-0.5">
                    <CheckBox
                      checked={done}
                      label={done ? 'Marcar módulo como não concluído' : 'Marcar módulo como concluído'}
                      onClick={() => dispatch({ type: 'MODULE_TOGGLE', courseId: cid, moduleId: m.id })}
                    />
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => toggleOpen(m.id)} aria-expanded={Boolean(expanded)}>
                    <p className={`text-sm font-semibold ${done ? 'text-mute' : ''}`}>
                      <span className="mr-2 text-mute">{String(idx + 1).padStart(2, '0')}</span>
                      {m.name}
                    </p>
                    {m.description && <p className="mt-0.5 line-clamp-2 text-xs text-mute">{m.description}</p>}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-28">
                        <ProgressBar value={pct} color={color} label={`Progresso do módulo ${m.name}`} />
                      </div>
                      <span className="text-[11px] text-mute">
                        {(m.lessons || []).length > 0 ? `${u.done}/${u.total} aulas` : done ? 'Concluído' : 'Pendente'}
                        {done && m.doneAt && ` · ${formatDate(m.doneAt)}`}
                      </span>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <IconAction icon={ArrowUp} label="Mover módulo para cima" disabled={idx === 0} onClick={() => dispatch({ type: 'MODULE_MOVE', courseId: cid, moduleId: m.id, dir: -1 })} />
                    <IconAction icon={ArrowDown} label="Mover módulo para baixo" disabled={idx === mods.length - 1} onClick={() => dispatch({ type: 'MODULE_MOVE', courseId: cid, moduleId: m.id, dir: 1 })} />
                    <IconAction icon={Pencil} label="Editar módulo" onClick={() => setModuleForm(m)} />
                    <IconAction icon={Trash2} label="Excluir módulo" danger onClick={() => setConfirm({ kind: 'module', module: m })} />
                    <IconAction icon={expanded ? ChevronUp : ChevronDown} label={expanded ? 'Recolher módulo' : 'Expandir módulo'} onClick={() => toggleOpen(m.id)} />
                  </div>
                </div>

                {expanded && (
                  <div className="animate-fadeIn border-t border-line bg-surface/50 px-4 py-3">
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="mb-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                        Abrir módulo na plataforma <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                    {m.note && (
                      <p className="mb-3 flex gap-2 whitespace-pre-wrap rounded-lg border border-line bg-card px-3 py-2 text-xs text-mute">
                        <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {m.note}
                      </p>
                    )}

                    {(m.lessons || []).length === 0 ? (
                      <p className="py-2 text-xs text-mute">Nenhuma aula cadastrada. Sem aulas, o módulo conta como uma única unidade de progresso.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {m.lessons.map((l, li) => (
                          <li key={l.id} className="flex items-center gap-3 py-2">
                            <CheckBox
                              checked={l.done}
                              label={l.done ? 'Marcar aula como não concluída' : 'Marcar aula como concluída'}
                              onClick={() => dispatch({ type: 'LESSON_TOGGLE', courseId: cid, moduleId: m.id, lessonId: l.id })}
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm ${l.done ? 'text-mute line-through' : ''}`}>{l.title}</p>
                              {(l.done && l.doneAt) || l.note ? (
                                <p className="truncate text-[11px] text-mute">
                                  {l.done && l.doneAt && `Concluída em ${formatDate(l.doneAt)}`}
                                  {l.done && l.doneAt && l.note && ' · '}
                                  {l.note && l.note.split('\n')[0]}
                                </p>
                              ) : null}
                            </div>
                            {l.url && (
                              <a href={l.url} target="_blank" rel="noopener noreferrer" className="icon-btn h-8 w-8" aria-label={`Abrir aula ${l.title}`}>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <IconAction icon={ArrowUp} label="Mover aula para cima" disabled={li === 0} onClick={() => dispatch({ type: 'LESSON_MOVE', courseId: cid, moduleId: m.id, lessonId: l.id, dir: -1 })} />
                            <IconAction icon={ArrowDown} label="Mover aula para baixo" disabled={li === m.lessons.length - 1} onClick={() => dispatch({ type: 'LESSON_MOVE', courseId: cid, moduleId: m.id, lessonId: l.id, dir: 1 })} />
                            <IconAction icon={Pencil} label="Editar aula" onClick={() => setLessonForm({ moduleId: m.id, lesson: l })} />
                            <IconAction icon={Trash2} label="Excluir aula" danger onClick={() => setConfirm({ kind: 'lesson', module: m, lesson: l })} />
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="btn-ghost mt-3" onClick={() => setLessonForm({ moduleId: m.id, lesson: null })}>
                      <Plus className="h-4 w-4" aria-hidden /> Adicionar aula ou tópico
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {moduleForm && (
        <ModuleForm
          key={moduleForm === 'new' ? 'new' : moduleForm.id}
          open
          initial={moduleForm === 'new' ? null : moduleForm}
          onClose={() => setModuleForm(null)}
          onSubmit={(data) => {
            if (moduleForm === 'new') {
              dispatch({ type: 'MODULE_ADD', courseId: cid, module: data });
              toast.success('Módulo adicionado.');
            } else {
              dispatch({ type: 'MODULE_UPDATE', courseId: cid, moduleId: moduleForm.id, changes: data });
              toast.success('Módulo atualizado.');
            }
            setModuleForm(null);
          }}
        />
      )}

      {lessonForm && (
        <LessonForm
          key={lessonForm.lesson?.id || 'new'}
          open
          initial={lessonForm.lesson}
          onClose={() => setLessonForm(null)}
          onSubmit={(data) => {
            if (lessonForm.lesson) {
              dispatch({ type: 'LESSON_UPDATE', courseId: cid, moduleId: lessonForm.moduleId, lessonId: lessonForm.lesson.id, changes: data });
              toast.success('Aula atualizada.');
            } else {
              dispatch({ type: 'LESSON_ADD', courseId: cid, moduleId: lessonForm.moduleId, lesson: data });
              toast.success('Aula adicionada.');
              setOpen((o) => ({ ...o, [lessonForm.moduleId]: true }));
            }
            setLessonForm(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.kind === 'module' ? 'Excluir módulo' : 'Excluir aula'}
        message={
          confirm?.kind === 'module'
            ? `Deseja excluir o módulo "${confirm?.module.name}" e todas as suas aulas? Esta ação não pode ser desfeita.`
            : `Deseja excluir a aula "${confirm?.lesson?.title}"? Esta ação não pode ser desfeita.`
        }
        onCancel={() => setConfirm(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
