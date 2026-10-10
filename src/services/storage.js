import { INITIAL_COURSES } from '../data/initialCourses';

const KEY = 'studyflow:data:v1';

export const DEFAULT_SETTINGS = {
  userName: 'Estudante',
  dailyGoalMin: 60,
  weeklyGoalMin: 300,
  courseGoals: {}, // { [courseId]: minutos por semana }
};

function emptyState() {
  return {
    version: 1,
    seeded: true,
    courses: INITIAL_COURSES.map((c) => ({ ...c, modules: [], updatedAt: new Date().toISOString() })),
    tasks: [],
    events: [],
    plans: [],
    sessions: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Remove registros com id repetido (garante que o seed nunca duplique). */
function dedupe(list = []) {
  const seen = new Set();
  return list.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function normalize(data) {
  const base = emptyState();
  return {
    ...base,
    ...data,
    courses: dedupe(data.courses),
    tasks: dedupe(data.tasks),
    events: dedupe(data.events),
    plans: dedupe(data.plans),
    sessions: dedupe(data.sessions),
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
  };
}

export const storage = {
  /** Lê os dados. Na primeira utilização cadastra os cursos iniciais. */
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        const fresh = emptyState();
        this.save(fresh);
        return fresh;
      }
      return normalize(JSON.parse(raw));
    } catch (err) {
      console.error('StudyFlow: falha ao ler dados locais.', err);
      return emptyState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('StudyFlow: falha ao salvar dados locais.', err);
      return false;
    }
  },

  reset() {
    const fresh = emptyState();
    this.save(fresh);
    return fresh;
  },

  exportJSON(state) {
    return JSON.stringify(state, null, 2);
  },

  importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.courses)) {
      throw new Error('Arquivo inválido: estrutura de dados do StudyFlow não encontrada.');
    }
    const next = normalize(parsed);
    this.save(next);
    return next;
  },
};
