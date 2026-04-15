import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark.tsx';
import { resendVerification } from '../api/auth.ts';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';

export default function CheckEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [resendEmail,   setResendEmail]   = useState(email);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus,  setResendStatus]  = useState<'idle' | 'sent' | 'error'>('idle');

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
          <BrandMark />
          <span className="font-display text-base font-bold text-white">TimeTrack</span>
        </div>

        <div>
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary-light mb-4">
            One more step
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Almost there.
          </h1>
          <p className="font-body text-base text-white/65 leading-relaxed max-w-xs">
            Check your inbox to activate your account and start tracking.
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
            <BrandMark />
            <span className="font-display text-base font-bold text-on-surface">TimeTrack</span>
          </div>

          {/* Email icon */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polyline points="2,4 12,13 22,4" />
            </svg>
          </div>

          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Check your inbox</h2>
          <p className="font-body text-sm text-on-surface/65 mb-8">
            {email
              ? <>We sent a verification link to <span className="text-on-surface/70 font-medium">{email}</span>.</>
              : 'We sent a verification link to your email address.'}
            {' '}Click the link to activate your account.
          </p>

          {resendStatus === 'sent' ? (
            <div className="bg-green-50 rounded-xl px-4 py-3 mb-6">
              <p className="font-body text-sm text-green-700">Verification email resent! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleResend} className="flex flex-col gap-4 mb-6">
              <Input
                label="Didn't receive it? Resend to"
                type="email"
                placeholder="your@email.com"
                value={resendEmail}
                onChange={setResendEmail}
              />
              {resendStatus === 'error' && (
                <p className="font-body text-xs text-red-600">Failed to resend. Check the email address and try again.</p>
              )}
              <Button type="submit" fullWidth disabled={resendLoading}>
                {resendLoading ? 'Sending…' : 'Resend verification email'}
              </Button>
            </form>
          )}

          <p className="font-body text-sm text-on-surface/65 text-center">
            Already verified?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
