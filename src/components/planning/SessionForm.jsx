import { useState } from 'react';
import Modal from '../ui/Modal';
import { Field } from '../ui/Field';
import CourseSelect from '../ui/CourseSelect';
import { todayISO } from '../../utils/dates';

/** Formulário compartilhado para sessões realizadas (mode="session") e blocos planejados (mode="plan"). */
export default function SessionForm({ open, onClose, onSubmit, initial, mode = 'session', defaultCourseId = '' }) {
  const isPlan = mode === 'plan';
  const editing = Boolean(initial?.id);
  const durationKey = isPlan ? 'plannedMin' : 'duration';
  const [form, setForm] = useState(() => ({
    courseId: defaultCourseId,
    date: todayISO(),
    [durationKey]: '',
    content: '',
    ...(initial || {}),
  }));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const minutes = Number(form[durationKey]);
    if (!form.courseId) errs.courseId = 'Selecione o curso.';
    if (!form.date) errs.date = 'Informe a data.';
    if (!minutes || minutes <= 0) errs[durationKey] = 'Informe uma duração maior que zero.';
    if (minutes > 1440) errs[durationKey] = 'A duração não pode passar de 24 horas.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, [durationKey]: Math.round(minutes), content: form.content.trim() });
  };

  const title = isPlan ? (editing ? 'Editar bloco planejado' : 'Planejar estudo') : editing ? 'Editar sessão' : 'Registrar sessão de estudo';
  const formId = `${mode}-form`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form={formId} className="btn-primary">
            {editing ? 'Salvar' : isPlan ? 'Planejar' : 'Registrar'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Curso" htmlFor="s-course" error={errors.courseId} className="sm:col-span-2">
          <CourseSelect id="s-course" value={form.courseId} onChange={(v) => setForm((f) => ({ ...f, courseId: v }))} />
        </Field>
        <Field label="Data" htmlFor="s-date" error={errors.date}>
          <input id="s-date" type="date" className="field" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Duração (minutos)" htmlFor="s-dur" error={errors[durationKey]}>
          <input id="s-dur" type="number" min="1" max="1440" inputMode="numeric" className="field" value={form[durationKey]} onChange={set(durationKey)} />
        </Field>
        <Field label="Conteúdo estudado" htmlFor="s-content" className="sm:col-span-2">
          <textarea id="s-content" rows={3} className="field resize-y" value={form.content} onChange={set('content')} placeholder={isPlan ? 'O que pretende estudar' : 'O que você estudou nesta sessão'} />
        </Field>
      </form>
    </Modal>
  );
}
