import { useMemo } from 'react';
import { useStore } from './useStore';
import { courseProgress } from '../utils/progress';
import { todayISO, diffDays, startOfWeekISO, addDaysISO } from '../utils/dates';

export function isOverdue(task, today = todayISO()) {
  return task.status !== 'concluida' && task.dueDate && task.dueDate < today;
}

export function isDueSoon(task, today = todayISO(), days = 7) {
  if (task.status === 'concluida' || !task.dueDate) return false;
  const n = diffDays(task.dueDate, today);
  return n >= 0 && n <= days;
}

export function useStats() {
  const { state } = useStore();

  return useMemo(() => {
    const today = todayISO();
    const { courses, tasks, events, sessions, plans } = state;

    const withProgress = courses.map((c) => ({ ...c, progress: courseProgress(c) }));
    const total = withProgress.length;
    const inProgress = withProgress.filter((c) => c.status === 'em_andamento').length;
    const done = withProgress.filter((c) => c.status === 'concluido').length;
    const overall = total ? Math.round(withProgress.reduce((s, c) => s + c.progress, 0) / total) : 0;

    const pendingTasks = tasks.filter((t) => t.status !== 'concluida');
    const overdueTasks = pendingTasks.filter((t) => isOverdue(t, today));
    const dueSoonTasks = pendingTasks.filter((t) => isDueSoon(t, today));

    const upcomingEvents = events
      .filter((e) => e.status !== 'concluido' && e.date >= today)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    const weekStart = startOfWeekISO(today);
    const weekEnd = addDaysISO(weekStart, 6);
    const sessionsToday = sessions.filter((s) => s.date === today);
    const sessionsWeek = sessions.filter((s) => s.date >= weekStart && s.date <= weekEnd);
    const minutesToday = sessionsToday.reduce((s, x) => s + (Number(x.duration) || 0), 0);
    const minutesWeek = sessionsWeek.reduce((s, x) => s + (Number(x.duration) || 0), 0);
    const minutesTotal = sessions.reduce((s, x) => s + (Number(x.duration) || 0), 0);

    const plannedWeek = plans
      .filter((p) => p.date >= weekStart && p.date <= weekEnd)
      .reduce((s, p) => s + (Number(p.plannedMin) || 0), 0);

    return {
      today,
      courses: withProgress,
      total,
      inProgress,
      done,
      overall,
      pendingTasks,
      overdueTasks,
      dueSoonTasks,
      upcomingEvents,
      minutesToday,
      minutesWeek,
      minutesTotal,
      plannedWeek,
      weekStart,
      weekEnd,
    };
  }, [state]);
}

export function useCourseMap() {
  const { state } = useStore();
  return useMemo(() => Object.fromEntries(state.courses.map((c) => [c.id, c])), [state.courses]);
}
