import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Save } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const TEMPLATES = [
  ['Resumo', '## Resumo da aula\n\n'],
  ['Conceito', '## Conceito importante\n\n'],
  ['Dúvida', '## Dúvida\n\n'],
  ['Exercício', '## Exercício para revisar\n\n'],
  ['Material', '## Links e materiais complementares\n\n'],
];

/** Anotações do curso com salvamento automático e botão de salvar explícito. */
export default function NotesPanel({ course }) {
  const { dispatch } = useStore();
  const [text, setText] = useState(course.notes || '');
  const [status, setStatus] = useState('saved'); // saved | dirty | saving
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
  const latest = useRef(text);
  const areaRef = useRef(null);

  const save = (value) => {
    setStatus('saving');
    dispatch({ type: 'COURSE_UPDATE', id: course.id, changes: { notes: value } });
    setTimeout(() => {
      setStatus('saved');
      setSavedAt(new Date());
    }, 250);
  };

  const onChange = (value) => {
    setText(value);
    latest.current = value;
    setStatus('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(latest.current), 900);
  };

  // Garante gravação ao sair da aba antes do debounce terminar.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        if (latest.current !== (course.notes || '')) {
          dispatch({ type: 'COURSE_UPDATE', id: course.id, changes: { notes: latest.current } });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const insert = (tpl) => {
    const prefix = text && !text.endsWith('\n\n') ? (text.endsWith('\n') ? '\n' : '\n\n') : '';
    onChange(`${text}${prefix}${tpl}`);
    setTimeout(() => {
      const el = areaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  };

  const indicator =
    status === 'saving' ? (
      <span className="flex items-center gap-1.5 text-xs text-mute">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Salvando…
      </span>
    ) : status === 'dirty' ? (
      <span className="text-xs text-amber-300">Alterações não salvas</span>
    ) : (
      <span className="flex items-center gap-1.5 text-xs text-emerald-300">
        <Check className="h-3.5 w-3.5" aria-hidden />
        {savedAt ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Tudo salvo'}
      </span>
    );

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(([label, tpl]) => (
            <button key={label} className="chip transition-colors hover:border-mute/50 hover:text-ink" onClick={() => insert(tpl)}>
              + {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3" aria-live="polite">
          {indicator}
          <button
            className="btn-ghost py-1.5"
            disabled={status !== 'dirty'}
            onClick={() => {
              clearTimeout(timer.current);
              save(latest.current);
            }}
          >
            <Save className="h-4 w-4" aria-hidden /> Salvar agora
          </button>
        </div>
      </div>
      <label htmlFor="course-notes" className="sr-only">
        Anotações do curso
      </label>
      <textarea
        id="course-notes"
        ref={areaRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        placeholder="Escreva resumos, conceitos importantes, dúvidas, exercícios para revisar e links complementares. As anotações são salvas automaticamente."
        className="field min-h-[320px] resize-y font-mono text-[13px] leading-relaxed"
      />
    </div>
  );
}
