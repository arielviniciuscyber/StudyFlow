import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ListChecks,
  Target,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/cursos', label: 'Meus cursos', icon: BookOpen },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays },
  { to: '/tarefas', label: 'Tarefas', icon: ListChecks },
  { to: '/planejamento', label: 'Planejamento', icon: Target },
  { to: '/historico', label: 'Histórico de estudos', icon: History },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

function Brand({ collapsed }) {
  return (
    <div className="flex h-16 items-center gap-3 px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-card">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M5 21c4 0 5-10 9-10s5 10 9 10" fill="none" stroke="#2A9DA8" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">StudyFlow</span>}
    </div>
  );
}

function NavList({ collapsed, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-accent-soft text-ink' : 'text-mute hover:bg-card hover:text-ink'
            } ${collapsed ? 'justify-center px-0' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-accent' : ''}`} aria-hidden />
              {!collapsed && <span className="truncate">{label}</span>}
              {collapsed && <span className="sr-only">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="border-t border-line p-3">
          <button
            onClick={onToggle}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mute transition-colors hover:bg-card hover:text-ink ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 animate-fadeIn bg-black/60" onClick={onCloseMobile} aria-hidden />
          <aside className="relative flex h-full w-72 max-w-[85%] animate-slideIn flex-col border-r border-line bg-surface">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button onClick={onCloseMobile} className="icon-btn" aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
