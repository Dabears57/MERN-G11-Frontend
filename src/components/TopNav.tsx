import { NavLink, useNavigate } from 'react-router-dom';
import { getUserInitial } from '../hooks/useAuth.ts';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/insights', label: 'Insights' },
  { to: '/sessions', label: 'Sessions' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const initial = getUserInitial();

  return (
    <nav className="sticky top-0 z-50 bg-surface/70 backdrop-blur-[20px]">
      <div className="max-w-[1320px] mx-auto px-10 flex items-center justify-between h-16">
        <div className="flex items-center gap-10">
          <NavLink to="/dashboard" className="font-display text-xl font-bold text-primary">
            TimeTrack
          </NavLink>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-body text-sm font-medium pb-0.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface/50 hover:text-on-surface border-b-2 border-transparent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/account')}
            className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center
              font-body text-sm font-semibold cursor-pointer hover:brightness-110 transition-all"
            title="Account settings"
          >
            {initial || (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
