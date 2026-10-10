import { Link } from 'react-router-dom';
import { Menu, Settings } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import NotificationsMenu from './NotificationsMenu';
import { useStore } from '../../hooks/useStore';
import { greeting, formatLongDate } from '../../utils/dates';

export default function Header({ onOpenMenu }) {
  const { state } = useStore();
  const now = new Date();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={onOpenMenu} className="icon-btn lg:hidden" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 shrink-0 md:block md:w-64 xl:w-72">
          <p className="truncate text-sm font-semibold">
            {greeting(now)}, {state.settings.userName}
          </p>
          <p className="truncate text-xs text-mute">{formatLongDate(now)}</p>
        </div>

        <div className="mx-auto min-w-0 flex-1 md:max-w-xl">
          <GlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationsMenu />
          <Link to="/configuracoes" className="icon-btn" aria-label="Configurações">
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
