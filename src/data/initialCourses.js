// Cursos cadastrados automaticamente na primeira utilização.
// IDs fixos garantem que nunca sejam duplicados.
// Campos como carga horária, certificado e conteúdo oficial ficam em branco
// para serem preenchidos manualmente — nada foi inventado.

const base = {
  status: 'nao_iniciado',
  progressMode: 'auto',
  manualProgress: 0,
  learns: '',
  startDate: '',
  endDate: '',
  workload: '',
  nextActivity: '',
  notes: '',
  modules: [],
};

export const INITIAL_COURSES = [
  {
    ...base,
    id: 'course-python-santander',
    name: 'Python',
    institution: 'Santander Open Academy',
    category: 'Programação',
    area: 'Programação e tecnologia',
    color: '#2A9DA8',
    objective:
      'Organizar os estudos de Python e acompanhar o aprendizado dos conceitos da linguagem.',
    description:
      'Curso para registrar e acompanhar os conteúdos estudados relacionados à linguagem Python. A descrição oficial detalhada poderá ser complementada posteriormente.',
    url: 'https://lms.santanderopenacademy.com/courses/822/modules',
  },
  {
    ...base,
    id: 'course-ti-fiap',
    name: 'Tecnologia da Informação',
    institution: 'FIAP',
    category: 'Tecnologia da Informação',
    area: 'Tecnologia da Informação',
    color: '#7C6BC4',
    objective:
      'Organizar os conteúdos de tecnologia, acompanhar módulos e registrar conhecimentos adquiridos.',
    description:
      'Espaço para acompanhar o curso de TI e registrar os temas estudados, exercícios e anotações.',
    url: 'https://on.fiap.com.br/nano-courses/meus-nanos/',
  },
  {
    ...base,
    id: 'course-gran-transpetro',
    name: 'Gran Cursos — Preparação Transpetro',
    institution: 'Gran Cursos Online',
    category: 'Concurso / Seleção',
    area: 'Preparação para processo seletivo ou concurso da Transpetro',
    color: '#4E9F7D',
    objective:
      'Organizar as matérias de preparação, acompanhar o conteúdo estudado e registrar exercícios e revisões.',
    description:
      'Ambiente para controlar as disciplinas, atividades, simulados e revisões relacionadas à preparação para a Transpetro.',
    url: 'https://www.grancursosonline.com.br/identificacao',
  },
  {
    ...base,
    id: 'course-caraguatatuba',
    name: 'Curso de Caraguatatuba',
    institution: 'Plataforma educacional de Caraguatatuba',
    category: 'A definir',
    area: 'A definir conforme o conteúdo do curso',
    color: '#5F86B8',
    objective:
      'Centralizar o acompanhamento das aulas, atividades e progresso do curso.',
    description:
      'Área individual para registrar informações, módulos, tarefas, anotações e prazos referentes ao curso.',
    url: 'https://caraguatatuba.edux.phorte.org.br/student',
  },
];
