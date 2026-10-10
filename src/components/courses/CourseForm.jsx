import { useState } from 'react';
import Modal from '../ui/Modal';
import { Field, Select } from '../ui/Field';
import { COURSE_STATUS, COURSE_COLORS, CATEGORY_SUGGESTIONS } from '../../utils/constants';
import { Check } from 'lucide-react';

const EMPTY = {
  name: '',
  institution: '',
  category: '',
  area: '',
  status: 'nao_iniciado',
  color: COURSE_COLORS[0],
  objective: '',
  description: '',
  learns: '',
  url: '',
  startDate: '',
  endDate: '',
  workload: '',
  nextActivity: '',
  progressMode: 'auto',
  manualProgress: 0,
};

const isValidUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export function validateCourse(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Informe o nome do curso.';
  if (!f.institution.trim()) e.institution = 'Informe a instituição ou plataforma.';
  if (!f.category.trim()) e.category = 'Informe uma categoria.';
  if (f.url && !isValidUrl(f.url.trim())) e.url = 'Informe um endereço válido iniciado por http:// ou https://.';
  if (f.startDate && f.endDate && f.endDate < f.startDate) e.endDate = 'A previsão não pode ser anterior ao início.';
  return e;
}

export default function CourseForm({ open, onClose, onSubmit, initial, categories = [] }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
  const [errors, setErrors] = useState({});
  const editing = Boolean(initial?.id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validateCourse(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const clean = {
      ...form,
      name: form.name.trim(),
      institution: form.institution.trim(),
      category: form.category.trim(),
      url: form.url.trim(),
    };
    onSubmit(clean);
  };

  const cats = Array.from(new Set([...CATEGORY_SUGGESTIONS, ...categories]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar curso' : 'Novo curso'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="course-form" className="btn-primary">
            {editing ? 'Salvar alterações' : 'Cadastrar curso'}
          </button>
        </>
      }
    >
      <form id="course-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nome do curso" htmlFor="c-name" error={errors.name} className="sm:col-span-2">
          <input id="c-name" className="field" value={form.name} onChange={set('name')} placeholder="Ex.: Python para análise de dados" />
        </Field>
        <Field label="Instituição ou plataforma" htmlFor="c-inst" error={errors.institution}>
          <input id="c-inst" className="field" value={form.institution} onChange={set('institution')} />
        </Field>
        <Field label="Categoria" htmlFor="c-cat" error={errors.category}>
          <input id="c-cat" className="field" list="cat-list" value={form.category} onChange={set('category')} />
          <datalist id="cat-list">
            {cats.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Área de conhecimento" htmlFor="c-area">
          <input id="c-area" className="field" value={form.area} onChange={set('area')} />
        </Field>
        <Field label="Status" htmlFor="c-status">
          <Select id="c-status" value={form.status} onChange={set('status')}>
            {Object.entries(COURSE_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Link oficial da plataforma" htmlFor="c-url" error={errors.url} className="sm:col-span-2">
          <input id="c-url" className="field" value={form.url} onChange={set('url')} placeholder="https://" inputMode="url" />
        </Field>
        <Field label="Objetivo" htmlFor="c-obj" className="sm:col-span-2">
          <textarea id="c-obj" rows={2} className="field resize-y" value={form.objective} onChange={set('objective')} />
        </Field>
        <Field label="Descrição do conteúdo" htmlFor="c-desc" className="sm:col-span-2">
          <textarea id="c-desc" rows={3} className="field resize-y" value={form.description} onChange={set('description')} />
        </Field>
        <Field
          label="O que o curso ensina"
          htmlFor="c-learns"
          hint="Preencha conforme o conteúdo oficial do curso."
          className="sm:col-span-2"
        >
          <textarea id="c-learns" rows={3} className="field resize-y" value={form.learns} onChange={set('learns')} />
        </Field>
        <Field label="Data de início" htmlFor="c-start">
          <input id="c-start" type="date" className="field" value={form.startDate} onChange={set('startDate')} />
        </Field>
        <Field label="Previsão de conclusão" htmlFor="c-end" error={errors.endDate}>
          <input id="c-end" type="date" className="field" value={form.endDate} onChange={set('endDate')} />
        </Field>
        <Field label="Carga horária" htmlFor="c-wl" hint="Opcional. Ex.: 40 horas">
          <input id="c-wl" className="field" value={form.workload} onChange={set('workload')} />
        </Field>
        <Field label="Próxima atividade ou módulo" htmlFor="c-next">
          <input id="c-next" className="field" value={form.nextActivity} onChange={set('nextActivity')} />
        </Field>
        <div className="sm:col-span-2">
          <span className="label">Cor de identificação</span>
          <div className="flex flex-wrap gap-2">
            {COURSE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line transition-transform hover:scale-105"
                style={{ background: c }}
                aria-label={`Cor ${c}`}
                aria-pressed={form.color === c}
              >
                {form.color === c && <Check className="h-4 w-4 text-white" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
