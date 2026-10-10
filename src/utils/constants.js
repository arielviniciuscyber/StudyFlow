export const COURSE_STATUS = {
  nao_iniciado: { label: 'Não iniciado', tone: 'text-mute border-line' },
  em_andamento: { label: 'Em andamento', tone: 'text-teal-300 border-teal-400/30 bg-teal-400/10' },
  pausado: { label: 'Pausado', tone: 'text-amber-300 border-amber-400/30 bg-amber-400/10' },
  concluido: { label: 'Concluído', tone: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' },
};

export const TASK_STATUS = {
  pendente: { label: 'Pendente', tone: 'text-mute border-line' },
  em_andamento: { label: 'Em andamento', tone: 'text-teal-300 border-teal-400/30 bg-teal-400/10' },
  concluida: { label: 'Concluída', tone: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' },
};

export const PRIORITY = {
  baixa: { label: 'Baixa', order: 1, tone: 'text-mute border-line' },
  media: { label: 'Média', order: 2, tone: 'text-sky-300 border-sky-400/30 bg-sky-400/10' },
  alta: { label: 'Alta', order: 3, tone: 'text-rose-300 border-rose-400/30 bg-rose-400/10' },
};

export const EVENT_TYPES = {
  prova: 'Prova',
  simulado: 'Simulado',
  revisao: 'Revisão',
  meta: 'Meta',
  aula: 'Aula',
  outro: 'Outro',
};

export const EVENT_STATUS = {
  pendente: 'Pendente',
  concluido: 'Concluído',
};

/** Cores discretas para identificação de cursos. */
export const COURSE_COLORS = [
  '#2A9DA8', // azul-petróleo
  '#7C6BC4', // violeta fechado
  '#4E9F7D', // verde discreto
  '#5F86B8', // azul aço
  '#B08A5A', // areia
  '#B06C86', // ameixa
  '#8A9A5B', // oliva
  '#6E7F96', // ardósia
];

export const CATEGORY_SUGGESTIONS = [
  'Programação',
  'Tecnologia da Informação',
  'Concurso / Seleção',
  'Idiomas',
  'Gestão',
  'Outros',
];
