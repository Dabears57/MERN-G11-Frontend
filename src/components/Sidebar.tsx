import { NavLink, useNavigate } from 'react-router-dom';
import { getUserInitial, getUserName } from '../hooks/useAuth.ts';

/* ── Icons ── */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 15 15" />
      <path d="M9 3h6" />
      <line x1="12" y1="3" x2="12" y2="5" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2"  y="12" width="4" height="9"  rx="1" />
      <rect x="10" y="6"  width="4" height="15" rx="1" />
      <rect x="18" y="2"  width="4" height="19" rx="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/projects',  label: 'Projects',  icon: <FolderIcon /> },
  { to: '/sessions',  label: 'Sessions',  icon: <TimerIcon /> },
  { to: '/insights',  label: 'Insights',  icon: <BarChartIcon /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const initial  = getUserInitial();
  const name     = getUserName();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[228px] bg-on-surface z-50 flex flex-col select-none"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-7">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-2 group"
        >
          <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" stroke="#004d44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
          <span className="font-display text-base font-bold text-white tracking-tight leading-none">
            TimeTrack
          </span>
        </NavLink>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 h-px bg-white/6" />

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto" role="navigation">
        <p className="px-3 mb-2 font-body text-[0.625rem] font-semibold tracking-[0.1em] uppercase text-white/20">
          Menu
        </p>
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-primary/25 text-primary'
                  : 'text-white/35 hover:bg-white/6 hover:text-white/70'
              }`
            }
          >
            <span className="shrink-0">{icon}</span>
            <span className="font-body text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Account */}
      <div className="px-3 pb-5">
        <div className="h-px bg-white/6 mb-4" />
        <button
          onClick={() => navigate('/account')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-white/35 hover:bg-white/6 hover:text-white/70
            transition-all duration-150 cursor-pointer text-left"
          aria-label="Account settings"
        >
          <div
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center
              font-body text-xs font-bold text-white shrink-0"
          >
            {initial || <UserIcon />}
          </div>
          <span className="font-body text-sm font-medium truncate">
            {name || 'Account'}
          </span>
        </button>
      </div>
    </aside>
  );
}
