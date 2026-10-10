import { useState } from 'react';
import Modal from '../ui/Modal';
import { Field, Select } from '../ui/Field';
import CourseSelect from '../ui/CourseSelect';
import { PRIORITY, TASK_STATUS } from '../../utils/constants';

export default function TaskForm({ open, onClose, onSubmit, initial, defaultCourseId = '' }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() => ({
    title: '',
    description: '',
    courseId: defaultCourseId,
    dueDate: '',
    priority: 'media',
    status: 'pendente',
    ...(initial || {}),
  }));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Informe o título da tarefa.';
    if (!form.courseId) errs.courseId = 'Selecione o curso relacionado.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar tarefa' : 'Nova tarefa'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="task-form" className="btn-primary">
            {editing ? 'Salvar alterações' : 'Criar tarefa'}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Título" htmlFor="t-title" error={errors.title} className="sm:col-span-2">
          <input id="t-title" className="field" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Descrição" htmlFor="t-desc" className="sm:col-span-2">
          <textarea id="t-desc" rows={3} className="field resize-y" value={form.description} onChange={set('description')} />
        </Field>
        <Field label="Curso" htmlFor="t-course" error={errors.courseId}>
          <CourseSelect id="t-course" value={form.courseId} onChange={(v) => setForm((f) => ({ ...f, courseId: v }))} />
        </Field>
        <Field label="Data de vencimento" htmlFor="t-due">
          <input id="t-due" type="date" className="field" value={form.dueDate} onChange={set('dueDate')} />
        </Field>
        <Field label="Prioridade" htmlFor="t-pri">
          <Select id="t-pri" value={form.priority} onChange={set('priority')}>
            {Object.entries(PRIORITY).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="t-status">
          <Select id="t-status" value={form.status} onChange={set('status')}>
            {Object.entries(TASK_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
