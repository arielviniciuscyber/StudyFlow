import { Check, Pencil, Trash2, CalendarDays } from 'lucide-react';
import Badge, { ColorDot } from '../ui/Badge';
import { PRIORITY, TASK_STATUS } from '../../utils/constants';
import { formatDate, relativeDay } from '../../utils/dates';
import { isOverdue } from '../../hooks/useStats';

export default function TaskRow({ task, course, onToggle, onEdit, onDelete, showCourse = true }) {
  const done = task.status === 'concluida';
  const overdue = isOverdue(task);

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-line hover:bg-surface/60">
      <button
        onClick={() => onToggle(task)}
        aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
        aria-pressed={done}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          done ? 'border-accent bg-accent text-white' : 'border-mute/50 hover:border-accent'
        }`}
      >
        {done && <Check className="h-3.5 w-3.5" aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? 'text-mute line-through' : ''}`}>{task.title}</p>
        {task.description && <p className="mt-0.5 line-clamp-2 text-xs text-mute">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {showCourse && course && (
            <span className="chip">
              <ColorDot color={course.color} />
              <span className="max-w-[160px] truncate">{course.name}</span>
            </span>
          )}
          {task.dueDate && (
            <span className={`chip ${overdue ? 'border-rose-400/30 text-rose-300' : ''}`}>
              <CalendarDays className="h-3 w-3" aria-hidden />
              {formatDate(task.dueDate, { day: '2-digit', month: 'short' })}
              {!done && <span className="opacity-70">· {relativeDay(task.dueDate)}</span>}
            </span>
          )}
          <Badge tone={PRIORITY[task.priority]?.tone}>{PRIORITY[task.priority]?.label}</Badge>
          {task.status === 'em_andamento' && <Badge tone={TASK_STATUS.em_andamento.tone}>Em andamento</Badge>}
          {done && task.completedAt && <span className="text-[11px] text-mute">Concluída em {formatDate(task.completedAt)}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button className="icon-btn h-8 w-8" onClick={() => onEdit(task)} aria-label="Editar tarefa">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="icon-btn h-8 w-8 hover:text-rose-300" onClick={() => onDelete(task)} aria-label="Excluir tarefa">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
