import { useNavigate } from 'react-router-dom';
import { logout, getUserEmail, getUserName, getUserInitial } from '../hooks/useAuth.ts';

export default function AccountPage() {
  const navigate = useNavigate();
  const email    = getUserEmail();
  const name     = getUserName();
  const initial  = getUserInitial();

  function handleSignOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="animate-fade-up max-w-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Account</h1>
        <p className="font-body text-sm text-on-surface/65 mt-1.5">Your profile and settings</p>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-surface-container-low rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center
          font-display text-xl font-bold text-white shrink-0">
          {initial || (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-display text-base font-bold text-on-surface">{name || 'User'}</p>
          <p className="font-body text-xs text-on-surface/65 mt-0.5">{email || 'No email'}</p>
        </div>
      </div>

      {/* Info fields */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65 mb-1">
            Display Name
          </p>
          <p className="font-body text-sm text-on-surface">{name || '—'}</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65 mb-1">
            Email Address
          </p>
          <p className="font-body text-sm text-on-surface">{email || '—'}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-container-highest mb-6" />

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 font-body text-sm font-medium text-red-700
          hover:text-red-700 transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}
