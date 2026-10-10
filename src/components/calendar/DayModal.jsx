import { Plus, Pencil, CheckSquare, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge, { ColorDot } from '../ui/Badge';
import { EVENT_TYPES } from '../../utils/constants';
import { formatLongDate, parseISO } from '../../utils/dates';

export default function DayModal({ date, items, courseMap, onClose, onAdd, onEdit, onToggleEvent, onOpenTask }) {
  const label = formatLongDate(parseISO(date));

  return (
    <Modal
      open
      onClose={onClose}
      title={label}
      footer={
        <button className="btn-primary" onClick={() => onAdd(date)}>
          <Plus className="h-4 w-4" aria-hidden /> Adicionar atividade
        </button>
      }
    >
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-mute">Nenhuma atividade neste dia.</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((it) => {
            const c = courseMap[it.courseId];
            return (
              <li key={it.key} className="flex items-start gap-3 py-3">
                <ColorDot color={c?.color} className="mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${it.done ? 'text-mute line-through' : ''}`}>{it.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-mute">
                    {c && <span className="truncate">{c.name}</span>}
                    {it.kind === 'event' ? (
                      <Badge>{EVENT_TYPES[it.raw.type] || 'Atividade'}</Badge>
                    ) : (
                      <Badge>Prazo de tarefa</Badge>
                    )}
                    {it.time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> {it.time}
                      </span>
                    )}
                  </div>
                  {it.raw.description && <p className="mt-1.5 whitespace-pre-wrap text-xs text-mute">{it.raw.description}</p>}
                </div>
                {it.kind === 'event' ? (
                  <div className="flex shrink-0 items-center">
                    <button
                      className="icon-btn h-8 w-8"
                      onClick={() => onToggleEvent(it.raw)}
                      aria-label={it.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                      title={it.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                    >
                      <CheckSquare className={`h-4 w-4 ${it.done ? 'text-accent' : ''}`} />
                    </button>
                    <button className="icon-btn h-8 w-8" onClick={() => onEdit(it.raw)} aria-label="Editar atividade">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button className="btn-ghost shrink-0 px-2.5 py-1 text-xs" onClick={() => onOpenTask(it.raw)}>
                    Ver tarefa
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
