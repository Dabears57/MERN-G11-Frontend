import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button.tsx';

const FEATURES = ['Project tracking', 'Focus sessions', 'Time insights'];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-[20px] h-14 flex items-center justify-between px-10">
        <span className="font-display text-xl font-bold text-primary">TimeTrack</span>
        <Link
          to="/login"
          className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex min-h-0">
        {/* Left column */}
        <div className="flex flex-col justify-center px-10 py-20 lg:pl-20 lg:pr-12 w-full lg:w-3/5">
          <p className="font-body text-xs tracking-widest uppercase text-primary mb-5">Focused Work</p>
          <h1 className="font-display font-bold leading-[0.9] text-on-surface text-5xl lg:text-7xl">
            Track time.<br />
            Work with<br />
            intention.
          </h1>
          <p className="font-body text-lg text-on-surface/60 mt-7 max-w-sm">
            A premium productivity manager for intentional work. Track projects, manage focus sessions,
            and gain clarity on how you spend your time.
          </p>

          <div className="mt-10 flex gap-4">
            <Button onClick={() => navigate('/register')}>Get Started</Button>
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          </div>

          <div className="mt-14 flex gap-8 flex-wrap">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="font-body text-xs text-on-surface/40">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — decorative preview, desktop only */}
        <div className="hidden lg:flex w-2/5 bg-surface-container-low items-center p-10">
          <div className="w-full rounded-2xl bg-on-surface p-7 flex flex-col gap-5">
            {/* Badge row */}
            <div className="flex items-center justify-between">
              <span className="bg-primary text-on-primary text-xs px-3 py-1 rounded-full font-body font-semibold tracking-wide">
                LIVE SESSION
              </span>
              <span className="font-body text-xs text-on-primary/40">2h 47m total</span>
            </div>

            {/* Timer display */}
            <div>
              <p className="font-body text-[0.65rem] text-on-primary/40 uppercase tracking-widest mb-1">Elapsed</p>
              <p className="font-display text-5xl font-bold text-on-primary leading-none">01h 24m 37s</p>
            </div>

            {/* Project */}
            <p className="font-body text-sm text-on-primary/40">Website Redesign</p>

            {/* Divider */}
            <div className="bg-on-primary/10 h-px" />

            {/* Tasks */}
            <div className="flex flex-col gap-2">
              {[
                { name: 'UI Design', active: true, time: '45m 12s' },
                { name: 'Wireframing', active: false, time: null },
                { name: 'Component Library', active: false, time: null },
              ].map((task) => (
                <div
                  key={task.name}
                  className={`rounded-lg px-4 py-3 flex items-center justify-between ${
                    task.active ? 'bg-primary/20' : 'bg-on-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.active ? 'bg-primary' : 'bg-on-primary/20'}`} />
                    <span className={`font-body text-sm ${task.active ? 'text-primary font-semibold' : 'text-on-primary/30'}`}>
                      {task.name}
                    </span>
                  </div>
                  {task.time && (
                    <span className="font-body text-xs text-primary/80 tabular-nums">{task.time}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
