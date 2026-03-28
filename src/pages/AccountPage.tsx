import { useNavigate } from 'react-router-dom';
import { logout, getUserEmail, getUserName } from '../hooks/useAuth.ts';

export default function AccountPage() {
  const navigate = useNavigate();
  const email = getUserEmail();
  const name = getUserName();

  function handleSignOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="max-w-xl pt-2">
      <h1 className="font-display text-[1.75rem] font-bold text-on-surface mb-8">
        Account Settings
      </h1>

      <div className="bg-surface-container-low rounded-xl p-6 mb-4">
        <p className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/50 mb-1">Name</p>
        <p className="font-body text-base text-on-surface">{name || 'Not available'}</p>
      </div>

      <div className="bg-surface-container-low rounded-xl p-6 mb-6">
        <p className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/50 mb-1">Email</p>
        <p className="font-body text-base text-on-surface">{email || 'Not available'}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="font-body text-sm font-medium px-5 py-2.5 rounded-xl
            bg-surface-container text-on-surface/70 hover:bg-surface-container-highest
            transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
