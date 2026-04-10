import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, resendVerification } from '../api/auth.ts';
import { saveToken } from '../hooks/useAuth.ts';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const passwordUpdated = (location.state as { passwordUpdated?: boolean } | null)?.passwordUpdated;

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [notVerified,   setNotVerified]   = useState(false);
  const [resendEmail,   setResendEmail]   = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus,  setResendStatus]  = useState<'idle' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotVerified(false);
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.token) {
      saveToken(result.token);
      navigate('/dashboard');
    } else if (result.emailNotVerified) {
      setNotVerified(true);
      setResendEmail(email);
    } else {
      setError(result.error ?? 'Login failed');
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    const result = await resendVerification(resendEmail);
    setResendLoading(false);
    setResendStatus(result.success ? 'sent' : 'error');
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
            Focused Work
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Welcome back.
          </h1>
          <p className="font-body text-base text-white/65 leading-relaxed max-w-xs">
            Sign in to continue tracking your projects and sessions.
          </p>
        </div>

        <p className="font-body text-xs text-white/55">
          © {new Date().getFullYear()} TimeTrack
        </p>
      </div>

      {/* Right panel — form */}
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

          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Sign in</h2>
          <p className="font-body text-sm text-on-surface/65 mb-8">Enter your credentials to continue</p>

          {passwordUpdated && (
            <div className="bg-green-50 rounded-xl px-4 py-3 mb-5">
              <p className="font-body text-sm text-green-700">Password updated — you can now sign in.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />

            <div className="flex flex-col gap-1">
              <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="font-body text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl px-4 py-3">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            {notVerified && (
              <div className="bg-amber-50 rounded-xl px-4 py-3 flex flex-col gap-3">
                <p className="font-body text-sm text-amber-800">
                  Your email isn&apos;t verified yet. Check your inbox for the verification link.
                </p>
                {resendStatus === 'sent' ? (
                  <p className="font-body text-xs text-green-700">Verification email resent!</p>
                ) : (
                  <form onSubmit={handleResend} className="flex flex-col gap-2">
                    <Input
                      label="Resend to"
                      type="email"
                      placeholder="your@email.com"
                      value={resendEmail}
                      onChange={setResendEmail}
                    />
                    {resendStatus === 'error' && (
                      <p className="font-body text-xs text-red-600">Failed to resend. Try again.</p>
                    )}
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="font-body text-xs text-primary hover:underline text-left disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending…' : 'Resend verification email'}
                    </button>
                  </form>
                )}
              </div>
            )}

            <Button type="submit" fullWidth className="mt-1" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="font-body text-sm text-on-surface/65 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
