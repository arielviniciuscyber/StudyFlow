import { Search, LayoutGrid, List } from 'lucide-react';
import { Select } from '../ui/Field';
import { COURSE_STATUS } from '../../utils/constants';

export const DEFAULT_FILTERS = {
  q: '',
  institution: '',
  category: '',
  status: '',
  progress: '',
  sort: 'recent',
  view: 'grid',
};

export const PROGRESS_RANGES = {
  '0': { label: 'Sem progresso (0%)', test: (p) => p === 0 },
  '1-49': { label: 'Iniciado (1% a 49%)', test: (p) => p >= 1 && p < 50 },
  '50-99': { label: 'Avançado (50% a 99%)', test: (p) => p >= 50 && p < 100 },
  '100': { label: 'Completo (100%)', test: (p) => p === 100 },
};

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function applyCourseFilters(courses, f) {
  const t = norm(f.q.trim());
  let list = courses.filter((c) => {
    if (t && !norm(`${c.name} ${c.institution} ${c.category} ${c.area}`).includes(t)) return false;
    if (f.institution && c.institution !== f.institution) return false;
    if (f.category && c.category !== f.category) return false;
    if (f.status && c.status !== f.status) return false;
    if (f.progress && !PROGRESS_RANGES[f.progress].test(c.progress)) return false;
    return true;
  });
  const sorters = {
    recent: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''),
    name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
    progress_desc: (a, b) => b.progress - a.progress,
    progress_asc: (a, b) => a.progress - b.progress,
  };
  list = [...list].sort(sorters[f.sort] || sorters.recent);
  return list;
}

export default function CourseFilters({ courses, filters, onChange }) {
  const institutions = [...new Set(courses.map((c) => c.institution))].sort();
  const categories = [...new Set(courses.map((c) => c.category))].sort();
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  const active = ['institution', 'category', 'status', 'progress'].some((k) => filters[k]) || filters.q;

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden />
          <input
            type="search"
            value={filters.q}
            onChange={set('q')}
            placeholder="Pesquisar cursos"
            aria-label="Pesquisar cursos"
            className="field pl-9"
          />
        </div>
        <Select aria-label="Ordenar cursos" value={filters.sort} onChange={set('sort')} style={{ width: 'auto' }}>
          <option value="recent">Mais recentes</option>
          <option value="name">Nome (A–Z)</option>
          <option value="progress_desc">Maior progresso</option>
          <option value="progress_asc">Menor progresso</option>
        </Select>
        <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Modo de visualização">
          {[
            ['grid', LayoutGrid, 'Grade'],
            ['list', List, 'Lista'],
          ].map(([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, view: v })}
              aria-pressed={filters.view === v}
              aria-label={`Visualizar em ${label.toLowerCase()}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                filters.view === v ? 'bg-card text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Select aria-label="Filtrar por instituição" value={filters.institution} onChange={set('institution')}>
          <option value="">Todas as instituições</option>
          {institutions.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por categoria" value={filters.category} onChange={set('category')}>
          <option value="">Todas as categorias</option>
          {categories.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por status" value={filters.status} onChange={set('status')}>
          <option value="">Todos os status</option>
          {Object.entries(COURSE_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filtrar por progresso" value={filters.progress} onChange={set('progress')}>
          <option value="">Qualquer progresso</option>
          {Object.entries(PROGRESS_RANGES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </Select>
      </div>

      {active && (
        <button
          className="text-xs text-accent hover:underline"
          onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort, view: filters.view })}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
