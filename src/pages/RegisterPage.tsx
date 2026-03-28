import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/auth.ts';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';

export default function RegisterPage() {
  const navigate          = useNavigate();
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6)          { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    const result = await createUser(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); } else { navigate('/login'); }
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
            Focused Work
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Get started.
          </h1>
          <p className="font-body text-base text-white/40 leading-relaxed max-w-xs">
            Create your account and start tracking your work sessions today.
          </p>
        </div>

        <p className="font-body text-xs text-white/20">
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

          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Create account</h2>
          <p className="font-body text-sm text-on-surface/40 mb-8">Get started with TimeTrack — it&apos;s free</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Email"            type="email"    placeholder="you@example.com"      value={email}           onChange={setEmail} />
            <Input label="Password"         type="password" placeholder="At least 6 characters" value={password}        onChange={setPassword} />
            <Input label="Confirm Password" type="password" placeholder="Repeat your password"  value={confirmPassword} onChange={setConfirmPassword} />

            <div className="bg-secondary-container rounded-xl px-4 py-3">
              <p className="font-body text-xs text-on-secondary-container leading-relaxed">
                You&apos;ll receive a confirmation email to verify your account after registration.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl px-4 py-3">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="font-body text-sm text-on-surface/40 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
