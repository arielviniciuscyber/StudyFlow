import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { COURSE_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/dates';

function PlatformButton({ url, className = '' }) {
  if (!url) {
    return (
      <button className={`btn-ghost opacity-50 ${className}`} disabled title="Nenhum link cadastrado">
        Plataforma
      </button>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`btn-ghost ${className}`}>
      Plataforma <ArrowUpRight className="h-4 w-4" aria-hidden />
    </a>
  );
}

export default function CourseCard({ course, view = 'grid' }) {
  const { id, name, institution, category, status, progress, nextActivity, updatedAt, color, url } = course;
  const st = COURSE_STATUS[status];

  if (view === 'list') {
    return (
      <article className="card flex flex-col gap-4 p-4 transition-colors hover:border-mute/40 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
          <div className="min-w-0">
            <Link to={`/cursos/${id}`} className="block truncate text-sm font-semibold hover:underline">
              {name}
            </Link>
            <p className="truncate text-xs text-mute">
              {institution} · {category}
            </p>
            {nextActivity && <p className="mt-1 truncate text-xs text-mute">Próximo: {nextActivity}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 md:w-72">
          <ProgressBar value={progress} color={color} label={`Progresso de ${name}`} />
          <span className="w-10 text-right text-xs tabular-nums text-mute">{progress}%</span>
        </div>
        <div className="md:w-28">
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
        <div className="flex gap-2">
          <PlatformButton url={url} />
          <Link to={`/cursos/${id}`} className="btn-primary">
            Detalhes
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="card flex flex-col p-5 transition-colors hover:border-mute/40">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 h-9 w-1 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
          <div className="min-w-0">
            <Link to={`/cursos/${id}`} className="block truncate text-[15px] font-semibold hover:underline">
              {name}
            </Link>
            <p className="truncate text-xs text-mute">{institution}</p>
          </div>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-mute">{category}</span>
        <span className="tabular-nums text-ink">{progress}%</span>
      </div>
      <ProgressBar value={progress} color={color} label={`Progresso de ${name}`} />

      <dl className="mt-4 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <dt className="shrink-0 text-mute">Próxima atividade</dt>
          <dd className="min-w-0 truncate">{nextActivity || 'Não cadastrada'}</dd>
        </div>
        <div className="flex items-center gap-2 text-mute">
          <Clock className="h-3 w-3" aria-hidden />
          <span>Atualizado em {formatDateTime(updatedAt)}</span>
        </div>
      </dl>

      <div className="mt-5 flex gap-2">
        <Link to={`/cursos/${id}`} className="btn-primary flex-1">
          Detalhes <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        <PlatformButton url={url} />
      </div>
    </article>
  );
}
