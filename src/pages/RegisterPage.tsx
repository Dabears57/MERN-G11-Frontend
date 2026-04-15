import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../api/auth.ts';
import BrandMark from '../components/BrandMark.tsx';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';
import PasswordStrengthBar, { isPasswordStrong } from '../components/PasswordStrengthBar.tsx';

export default function RegisterPage() {
  const navigate          = useNavigate();
  const [firstName,       setFirstName]       = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!firstName.trim())            { setError('First name is required'); return; }
    if (password !== confirmPassword)  { setError('Passwords do not match'); return; }
    if (!isPasswordStrong(password))   { setError('Please choose a stronger password'); return; }

    setLoading(true);
    const result = await createUser(email, password, firstName.trim());
    setLoading(false);
    if (result.error) { setError(result.error); } else { navigate('/check-email', { state: { email } }); }
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
            Focused Work
          </p>
          <h1 className="font-display text-[2.5rem] font-bold text-white leading-tight mb-4">
            Get started.
          </h1>
          <p className="font-body text-base text-white/65 leading-relaxed max-w-xs">
            Create your account and start tracking your work sessions today.
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
            <BrandMark />
            <span className="font-display text-base font-bold text-on-surface">TimeTrack</span>
          </div>

          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1.5">Create account</h2>
          <p className="font-body text-sm text-on-surface/65 mb-8">Get started with TimeTrack — it&apos;s free</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="First Name"       type="text"     placeholder="Your first name"       value={firstName}       onChange={setFirstName} autoFocus />
            <Input label="Email"            type="email"    placeholder="you@example.com"       value={email}           onChange={setEmail} />
            <Input label="Password"         type="password" placeholder="At least 8 characters" value={password}        onChange={setPassword} />
            <PasswordStrengthBar password={password} />
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

          <p className="font-body text-sm text-on-surface/65 text-center mt-6">
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
