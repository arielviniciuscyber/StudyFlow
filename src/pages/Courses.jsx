import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import CourseFilters, { DEFAULT_FILTERS, applyCourseFilters } from '../components/courses/CourseFilters';
import { useStats } from '../hooks/useStats';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';

export default function Courses() {
  const stats = useStats();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [creating, setCreating] = useState(false);

  const list = applyCourseFilters(stats.courses, filters);
  const hasFilters = filters.q || filters.institution || filters.category || filters.status || filters.progress;

  const handleCreate = (data) => {
    dispatch({ type: 'COURSE_ADD', course: data });
    setCreating(false);
    toast.success('Curso cadastrado com sucesso.');
  };

  return (
    <>
      <PageHeader
        title="Meus cursos"
        subtitle={`${stats.total} ${stats.total === 1 ? 'curso cadastrado' : 'cursos cadastrados'}`}
        actions={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Novo curso
          </button>
        }
      />

      <CourseFilters courses={stats.courses} filters={filters} onChange={setFilters} />

      {list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={hasFilters ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'}
          description={
            hasFilters
              ? 'Ajuste a pesquisa ou limpe os filtros para ver todos os cursos.'
              : 'Cadastre seu primeiro curso para começar a acompanhar seus estudos.'
          }
          action={
            hasFilters ? (
              <button className="btn-ghost" onClick={() => setFilters({ ...DEFAULT_FILTERS, view: filters.view })}>
                Limpar filtros
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" aria-hidden /> Novo curso
              </button>
            )
          }
        />
      ) : (
        <div className={filters.view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {list.map((c) => (
            <CourseCard key={c.id} course={c} view={filters.view} />
          ))}
        </div>
      )}

      {creating && (
        <CourseForm
          open
          categories={state.courses.map((c) => c.category)}
          onClose={() => setCreating(false)}
          onSubmit={(data) => {
            handleCreate(data);
          }}
        />
      )}
    </>
  );
}
