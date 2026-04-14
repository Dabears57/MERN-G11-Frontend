import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth.ts';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';
import PasswordStrengthBar, { isPasswordStrong } from '../components/PasswordStrengthBar.tsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong(newPassword))   { setError('Please choose a stronger password'); return; }
    if (newPassword !== confirmPassword)  { setError('Passwords do not match'); return; }
    if (!token || !email)                 { setError('Invalid reset link. Please request a new one.'); return; }

    setLoading(true);
    const result = await resetPassword(email, token, newPassword);
    setLoading(false);

    if (result.success) {
      navigate('/login', { state: { passwordUpdated: true } });
    } else {
      setError(result.error ?? 'Failed to reset password. The link may have expired.');
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-[42%] bg-on-surface flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" stroke="#004d44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
          <span className="font-display text-base font-bold text-white">TimeTrack</span>
        </div>

        <div>
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary-light mb-4">
            Account recovery
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Choose a new password.
          </h1>
          <p className="font-body text-base text-white/65 leading-relaxed max-w-xs">
            Pick something strong and you won&apos;t need to do this again.
          </p>
        </div>

        <p className="font-body text-xs text-white/55">
          © {new Date().getFullYear()} TimeTrack
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 animate-fade-up">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" stroke="#004d44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span className="font-display text-base font-bold text-on-surface">TimeTrack</span>
          </div>

          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">New password</h2>
          <p className="font-body text-sm text-on-surface/65 mb-8">Choose a new password for your account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={setNewPassword}
              autoFocus
            />
            <PasswordStrengthBar password={newPassword} />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {error && (
              <div className="bg-red-50 rounded-xl px-4 py-3">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Updating password…' : 'Update password'}
            </Button>
          </form>

          <p className="font-body text-sm text-on-surface/65 text-center mt-6">
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
