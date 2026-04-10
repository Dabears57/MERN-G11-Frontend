import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button.tsx';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      </svg>
    ),
    title: 'Project Tracking',
    description:
      'Organize work into projects, assign tasks, and monitor completion — all in one place.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <polyline points="12 9 12 13 15 15" />
        <path d="M9 3h6" /><line x1="12" y1="3" x2="12" y2="5" />
      </svg>
    ),
    title: 'Focus Sessions',
    description:
      'Start timed work sessions with per-task tracking. Know exactly where your hours go.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2"  y="12" width="4" height="9"  rx="1" />
        <rect x="10" y="6"  width="4" height="15" rx="1" />
        <rect x="18" y="2"  width="4" height="19" rx="1" />
      </svg>
    ),
    title: 'Time Insights',
    description:
      'Visualize your productivity patterns with heatmaps and session trend analytics.',
  },
];

// Decorative session preview card (static UI demo — not live data)
function SessionPreviewCard() {
  return (
    <div className="w-full rounded-2xl bg-on-surface p-6 flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          <span className="font-body text-xs text-primary-light font-semibold uppercase tracking-wide">Live Session</span>
        </div>
        <span className="font-body text-xs text-white/60 tabular-nums">2h 47m total</span>
      </div>

      {/* Timer display */}
      <div>
        <p className="font-body text-[0.6rem] text-white/60 uppercase tracking-widest mb-1">Elapsed</p>
        <p className="font-display text-4xl font-bold text-white leading-none tabular-nums">01h 24m 37s</p>
      </div>

      {/* Project label */}
      <p className="font-body text-sm text-white/65">Website Redesign</p>

      {/* Divider */}
      <div className="bg-white/8 h-px" />

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {[
          { name: 'UI Design',        active: true,  time: '45m 12s' },
          { name: 'Wireframing',      active: false, time: null },
          { name: 'Component Library', active: false, time: null },
        ].map((task) => (
          <div
            key={task.name}
            className={`rounded-xl px-4 py-2.5 flex items-center justify-between ${
              task.active ? 'bg-primary/20' : 'bg-white/4'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.active ? 'bg-primary' : 'bg-white/15'}`} />
              <span className={`font-body text-sm ${task.active ? 'text-primary-light font-semibold' : 'text-white/55'}`}>
                {task.name}
              </span>
            </div>
            {task.time && (
              <span className="font-body text-xs text-primary-light tabular-nums">{task.time}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 bg-surface/85 backdrop-blur-[20px]">
        <div className="max-w-[1320px] mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" stroke="#004d44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span className="font-display text-base font-bold text-on-surface tracking-tight">TimeTrack</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="font-body text-sm text-on-surface/65 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex min-h-0">
        {/* Left: copy */}
        <div className="flex flex-col justify-center px-8 py-20 lg:pl-16 lg:pr-10 w-full lg:w-[55%]">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-primary mb-5">
            Focused Work
          </p>
          <h1 className="font-display font-bold leading-[0.92] text-on-surface text-5xl lg:text-[4.25rem] mb-7">
            Track time.<br />
            Work with<br />
            intention.
          </h1>
          <p className="font-body text-lg text-on-surface/70 max-w-sm leading-relaxed mb-10">
            {/* TODO: Update copy to match your brand voice */}
            A premium productivity workspace for intentional work. Track projects, run focus sessions, and gain clarity on how your time is spent.
          </p>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/register')}>Get Started — Free</Button>
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>

        {/* Right: decorative preview */}
        <div className="hidden lg:flex w-[45%] bg-surface-container-low items-center justify-center p-10">
          <div className="w-full max-w-sm">
            <SessionPreviewCard />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-container-low py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-12 text-center">
            <p className="font-body text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-primary mb-3">
              What's included
            </p>
            <h2 className="font-display text-[2rem] font-bold text-on-surface">
              Everything you need to work better
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, description }) => (
              <div key={title} className="bg-surface rounded-2xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-display text-base font-bold text-on-surface">{title}</h3>
                <p className="font-body text-sm text-on-surface/65 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-[2rem] font-bold text-on-surface mb-3">
            {/* TODO: Update with final CTA copy */}
            Ready to take control of your time?
          </h2>
          <p className="font-body text-base text-on-surface/65 mb-8 leading-relaxed">
            Join and start tracking your work sessions today.
          </p>
          <Button onClick={() => navigate('/register')}>Create Free Account</Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-container-highest py-6 px-8">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between">
          <span className="font-body text-xs text-on-surface/65">
            {/* TODO: Update with your organization name */}
            © {new Date().getFullYear()} TimeTrack
          </span>
          <div className="flex items-center gap-6">
            <Link to="/login"    className="font-body text-xs text-on-surface/65 hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="font-body text-xs text-on-surface/65 hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
