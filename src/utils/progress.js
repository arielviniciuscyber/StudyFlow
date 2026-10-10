/** Unidades de progresso: cada aula conta; módulo sem aulas conta como uma unidade. */
export function moduleUnits(mod) {
  const lessons = mod.lessons || [];
  if (lessons.length === 0) return { done: mod.done ? 1 : 0, total: 1 };
  return { done: lessons.filter((l) => l.done).length, total: lessons.length };
}

export function isModuleDone(mod) {
  const { done, total } = moduleUnits(mod);
  return total > 0 && done === total;
}

export function autoProgress(course) {
  const mods = course.modules || [];
  if (mods.length === 0) return null;
  let done = 0;
  let total = 0;
  mods.forEach((m) => {
    const u = moduleUnits(m);
    done += u.done;
    total += u.total;
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** Progresso efetivo: manual (se ativado) ou calculado a partir dos módulos. */
export function courseProgress(course) {
  if (course.progressMode === 'manual') return clamp(course.manualProgress ?? 0);
  const auto = autoProgress(course);
  if (auto === null) return clamp(course.manualProgress ?? 0);
  return auto;
}

export const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, Number(n) || 0));
