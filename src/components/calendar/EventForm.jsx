import { useState } from 'react';
import Modal from '../ui/Modal';
import { Field, Select } from '../ui/Field';
import CourseSelect from '../ui/CourseSelect';
import { EVENT_TYPES, EVENT_STATUS } from '../../utils/constants';
import { Trash2 } from 'lucide-react';

export default function EventForm({ open, onClose, onSubmit, onDelete, initial, defaultDate, defaultCourseId = '' }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() => ({
    title: '',
    courseId: defaultCourseId,
    date: defaultDate || '',
    time: '',
    type: 'revisao',
    description: '',
    status: 'pendente',
    ...(initial || {}),
  }));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Informe o título da atividade.';
    if (!form.courseId) errs.courseId = 'Selecione o curso relacionado.';
    if (!form.date) errs.date = 'Informe a data.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, title: form.title.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar atividade' : 'Nova atividade'}
      footer={
        <>
          {editing && (
            <button type="button" className="btn-danger mr-auto" onClick={() => onDelete(initial)}>
              <Trash2 className="h-4 w-4" aria-hidden /> Excluir
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="event-form" className="btn-primary">
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Título" htmlFor="e-title" error={errors.title} className="sm:col-span-2">
          <input id="e-title" className="field" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Curso" htmlFor="e-course" error={errors.courseId}>
          <CourseSelect id="e-course" value={form.courseId} onChange={(v) => setForm((f) => ({ ...f, courseId: v }))} />
        </Field>
        <Field label="Tipo" htmlFor="e-type">
          <Select id="e-type" value={form.type} onChange={set('type')}>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data" htmlFor="e-date" error={errors.date}>
          <input id="e-date" type="date" className="field" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Horário (opcional)" htmlFor="e-time">
          <input id="e-time" type="time" className="field" value={form.time} onChange={set('time')} />
        </Field>
        <Field label="Status" htmlFor="e-status">
          <Select id="e-status" value={form.status} onChange={set('status')}>
            {Object.entries(EVENT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Descrição" htmlFor="e-desc" className="sm:col-span-2">
          <textarea id="e-desc" rows={3} className="field resize-y" value={form.description} onChange={set('description')} />
        </Field>
      </form>
    </Modal>
  );
}
