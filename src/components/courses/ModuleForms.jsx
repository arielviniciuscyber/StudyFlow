import { useState } from 'react';
import Modal from '../ui/Modal';
import { Field } from '../ui/Field';

const isValidUrl = (v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export function ModuleForm({ open, onClose, onSubmit, initial }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() => ({ name: '', description: '', url: '', note: '', doneAt: '', ...(initial || {}) }));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Informe o nome do módulo.';
    if (!isValidUrl(form.url.trim())) errs.url = 'Informe um endereço válido (http:// ou https://).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ name: form.name.trim(), description: form.description.trim(), url: form.url.trim(), note: form.note, doneAt: form.doneAt });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar módulo' : 'Novo módulo'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="module-form" className="btn-primary">
            {editing ? 'Salvar' : 'Adicionar módulo'}
          </button>
        </>
      }
    >
      <form id="module-form" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nome do módulo" htmlFor="m-name" error={errors.name}>
          <input id="m-name" className="field" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Descrição" htmlFor="m-desc">
          <textarea id="m-desc" rows={2} className="field resize-y" value={form.description} onChange={set('description')} />
        </Field>
        <Field label="Link de acesso (opcional)" htmlFor="m-url" error={errors.url}>
          <input id="m-url" className="field" value={form.url} onChange={set('url')} placeholder="https://" inputMode="url" />
        </Field>
        {editing && (
          <Field label="Data de conclusão" htmlFor="m-done" hint="Preenchida automaticamente ao concluir. Pode ser ajustada.">
            <input id="m-done" type="date" className="field" value={form.doneAt} onChange={set('doneAt')} />
          </Field>
        )}
        <Field label="Anotações do módulo" htmlFor="m-note">
          <textarea id="m-note" rows={3} className="field resize-y" value={form.note} onChange={set('note')} />
        </Field>
      </form>
    </Modal>
  );
}

export function LessonForm({ open, onClose, onSubmit, initial }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(() => ({ title: '', url: '', note: '', doneAt: '', ...(initial || {}) }));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Informe o título da aula ou tópico.';
    if (!isValidUrl(form.url.trim())) errs.url = 'Informe um endereço válido (http:// ou https://).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ title: form.title.trim(), url: form.url.trim(), note: form.note, doneAt: form.doneAt });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar aula ou tópico' : 'Nova aula ou tópico'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="lesson-form" className="btn-primary">
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
        </>
      }
    >
      <form id="lesson-form" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Título" htmlFor="l-title" error={errors.title}>
          <input id="l-title" className="field" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Link de acesso (opcional)" htmlFor="l-url" error={errors.url}>
          <input id="l-url" className="field" value={form.url} onChange={set('url')} placeholder="https://" inputMode="url" />
        </Field>
        {editing && (
          <Field label="Data de conclusão" htmlFor="l-done">
            <input id="l-done" type="date" className="field" value={form.doneAt} onChange={set('doneAt')} />
          </Field>
        )}
        <Field label="Anotações da aula" htmlFor="l-note">
          <textarea id="l-note" rows={3} className="field resize-y" value={form.note} onChange={set('note')} />
        </Field>
      </form>
    </Modal>
  );
}
