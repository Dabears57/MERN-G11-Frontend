import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/auth.ts';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';

const FEATURES = ['Project tracking', 'Focus sessions', 'Time insights'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await createUser(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-surface-container-low">
        <div className="max-w-md px-12">
          <p className="font-body text-xs tracking-widest uppercase text-primary/60 mb-3">Focused Work</p>
          <h1 className="font-display text-[3.5rem] font-bold text-primary mb-4 leading-tight">
            TimeTrack
          </h1>
          <p className="font-body text-lg text-on-surface/60 mb-8">
            Start tracking your productivity with precision. Create an account to get started.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="font-body text-sm text-on-surface/50">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1">Create account</h2>
          <p className="font-body text-sm text-on-surface/50 mb-10">Get started with TimeTrack</p>

          <div className="flex flex-col gap-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={setPassword}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>

          <div className="mt-5 bg-secondary-container rounded-xl px-4 py-3">
            <p className="font-body text-xs text-on-secondary-container">
              Email verification will be required to activate your account. You will receive a
              confirmation email after registration.
            </p>
          </div>

          {error && (
            <p className="font-body text-sm text-red-600 mt-4">{error}</p>
          )}

          <Button type="submit" fullWidth className="mt-6" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="font-body text-sm text-on-surface/50 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
