import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../api/auth.ts';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status,        setStatus]        = useState<'loading' | 'success' | 'error'>('loading');
  const [resendEmail,   setResendEmail]   = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus,  setResendStatus]  = useState<'idle' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    verifyEmail(token).then((result) => {
      setStatus(result.success ? 'success' : 'error');
    });
  }, [token]);

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
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary/70 mb-4">
            Account setup
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Verifying your account.
          </h1>
          <p className="font-body text-base text-white/40 leading-relaxed max-w-xs">
            Just a moment while we confirm your email address.
          </p>
        </div>

        <p className="font-body text-xs text-white/20">
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

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="font-body text-sm text-on-surface/40">Verifying your email…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Email verified!</h2>
                <p className="font-body text-sm text-on-surface/40">Your account is active. You can now sign in.</p>
              </div>
              <Link to="/login">
                <Button fullWidth>Go to sign in</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Link expired</h2>
                <p className="font-body text-sm text-on-surface/40 mb-6">
                  This verification link is invalid or has expired. Request a new one below.
                </p>

                {resendStatus === 'sent' ? (
                  <div className="bg-green-50 rounded-xl px-4 py-3">
                    <p className="font-body text-sm text-green-700">Verification email sent! Check your inbox.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="flex flex-col gap-4">
                    <Input
                      label="Your email"
                      type="email"
                      placeholder="you@example.com"
                      value={resendEmail}
                      onChange={setResendEmail}
                      autoFocus
                    />
                    {resendStatus === 'error' && (
                      <p className="font-body text-xs text-red-600">Failed to resend. Check the email and try again.</p>
                    )}
                    <Button type="submit" fullWidth disabled={resendLoading}>
                      {resendLoading ? 'Sending…' : 'Resend verification email'}
                    </Button>
                  </form>
                )}
              </div>
              <p className="font-body text-sm text-on-surface/40 text-center">
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
