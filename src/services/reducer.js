import { uid } from '../utils/id';
import { todayISO } from '../utils/dates';
import { courseProgress, isModuleDone } from '../utils/progress';

const now = () => new Date().toISOString();

/** Ajusta o status do curso conforme o progresso calculado (apenas em modo automático). */
function syncStatus(course) {
  if (course.progressMode === 'manual') return course;
  if (!(course.modules || []).length) return course;
  const p = courseProgress(course);
  if (p >= 100 && course.status !== 'concluido') return { ...course, status: 'concluido' };
  if (p > 0 && p < 100 && (course.status === 'nao_iniciado' || course.status === 'concluido')) {
    return { ...course, status: 'em_andamento' };
  }
  if (p === 0 && course.status === 'concluido') return { ...course, status: 'em_andamento' };
  return course;
}

// sync=false preserva o status escolhido manualmente pela pessoa.
const touch = (course, sync = true) => ({ ...(sync ? syncStatus(course) : course), updatedAt: now() });

function mapCourse(state, courseId, fn, sync = true) {
  return { ...state, courses: state.courses.map((c) => (c.id === courseId ? touch(fn(c), sync) : c)) };
}

function mapModule(course, moduleId, fn) {
  return { ...course, modules: course.modules.map((m) => (m.id === moduleId ? fn(m) : m)) };
}

function move(list, id, dir) {
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'REPLACE':
      return action.state;

    // ---------- Cursos ----------
    case 'COURSE_ADD':
      return { ...state, courses: [...state.courses, { ...action.course, id: uid('course'), modules: [], updatedAt: now() }] };
    case 'COURSE_UPDATE':
      return mapCourse(state, action.id, (c) => ({ ...c, ...action.changes }), false);
    case 'COURSE_DELETE':
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.id),
        tasks: state.tasks.filter((t) => t.courseId !== action.id),
        events: state.events.filter((e) => e.courseId !== action.id),
        plans: state.plans.filter((p) => p.courseId !== action.id),
        sessions: state.sessions.filter((s) => s.courseId !== action.id),
      };

    // ---------- Módulos ----------
    case 'MODULE_ADD':
      return mapCourse(state, action.courseId, (c) => ({
        ...c,
        modules: [
          ...c.modules,
          { id: uid('mod'), name: '', description: '', done: false, doneAt: '', note: '', url: '', lessons: [], ...action.module },
        ],
      }));
    case 'MODULE_UPDATE':
      return mapCourse(state, action.courseId, (c) => mapModule(c, action.moduleId, (m) => ({ ...m, ...action.changes })));
    case 'MODULE_DELETE':
      return mapCourse(state, action.courseId, (c) => ({ ...c, modules: c.modules.filter((m) => m.id !== action.moduleId) }));
    case 'MODULE_MOVE':
      return mapCourse(state, action.courseId, (c) => ({ ...c, modules: move(c.modules, action.moduleId, action.dir) }));
    case 'MODULE_TOGGLE':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => {
          const done = !isModuleDone(m);
          const date = done ? todayISO() : '';
          return {
            ...m,
            done,
            doneAt: date,
            lessons: (m.lessons || []).map((l) => ({ ...l, done, doneAt: date })),
          };
        })
      );

    // ---------- Aulas ----------
    case 'LESSON_ADD':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => {
          const lessons = [...(m.lessons || []), { id: uid('les'), title: '', done: false, doneAt: '', note: '', url: '', ...action.lesson }];
          const mm = { ...m, lessons };
          return { ...mm, done: isModuleDone(mm), doneAt: isModuleDone(mm) ? m.doneAt : '' };
        })
      );
    case 'LESSON_UPDATE':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === action.lessonId ? { ...l, ...action.changes } : l)),
        }))
      );
    case 'LESSON_DELETE':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => {
          const mm = { ...m, lessons: m.lessons.filter((l) => l.id !== action.lessonId) };
          return { ...mm, done: mm.lessons.length ? isModuleDone(mm) : false };
        })
      );
    case 'LESSON_MOVE':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => ({ ...m, lessons: move(m.lessons, action.lessonId, action.dir) }))
      );
    case 'LESSON_TOGGLE':
      return mapCourse(state, action.courseId, (c) =>
        mapModule(c, action.moduleId, (m) => {
          const lessons = m.lessons.map((l) =>
            l.id === action.lessonId ? { ...l, done: !l.done, doneAt: !l.done ? todayISO() : '' } : l
          );
          const mm = { ...m, lessons };
          const done = isModuleDone(mm);
          return { ...mm, done, doneAt: done ? todayISO() : '' };
        })
      );

    // ---------- Tarefas ----------
    case 'TASK_ADD':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: uid('task'),
            status: 'pendente',
            completedAt: '',
            createdAt: now(),
            ...action.task,
            completedAt: action.task.status === 'concluida' ? todayISO() : '',
          },
        ],
      };
    case 'TASK_UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.id) return t;
          const next = { ...t, ...action.changes };
          if (next.status === 'concluida' && !next.completedAt) next.completedAt = todayISO();
          if (next.status !== 'concluida') next.completedAt = '';
          return next;
        }),
      };
    case 'TASK_TOGGLE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? t.status === 'concluida'
              ? { ...t, status: 'pendente', completedAt: '' }
              : { ...t, status: 'concluida', completedAt: todayISO() }
            : t
        ),
      };
    case 'TASK_DELETE':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    // ---------- Eventos ----------
    case 'EVENT_ADD':
      return { ...state, events: [...state.events, { id: uid('evt'), status: 'pendente', ...action.event }] };
    case 'EVENT_UPDATE':
      return { ...state, events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.changes } : e)) };
    case 'EVENT_DELETE':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };

    // ---------- Planejamento (blocos planejados) ----------
    case 'PLAN_ADD':
      return { ...state, plans: [...state.plans, { id: uid('plan'), ...action.plan }] };
    case 'PLAN_DELETE':
      return { ...state, plans: state.plans.filter((p) => p.id !== action.id) };

    // ---------- Sessões de estudo ----------
    case 'SESSION_ADD':
      return {
        ...state,
        sessions: [...state.sessions, { id: uid('ses'), ...action.session }],
        courses: state.courses.map((c) => (c.id === action.session.courseId ? { ...c, updatedAt: now() } : c)),
      };
    case 'SESSION_UPDATE':
      return { ...state, sessions: state.sessions.map((s) => (s.id === action.id ? { ...s, ...action.changes } : s)) };
    case 'SESSION_DELETE':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };

    // ---------- Configurações ----------
    case 'SETTINGS_UPDATE':
      return { ...state, settings: { ...state.settings, ...action.changes } };

    default:
      return state;
  }
}
