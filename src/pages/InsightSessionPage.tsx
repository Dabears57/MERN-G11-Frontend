import { useParams, Link } from 'react-router-dom';
import { MOCK_SESSIONS } from '../data/mock.ts';

export default function InsightSessionPage() {
  const { id } = useParams<{ id: string }>();
  const session = MOCK_SESSIONS.find((s) => s.id === id);

  return (
    <div>
      <Link to="/insights" className="font-body text-sm text-on-surface/50 hover:text-primary mb-4 inline-block">
        &larr; Back to Insights
      </Link>
      <h1 className="font-display text-[3.5rem] font-bold text-on-surface mb-2">
        Session Insights
      </h1>
      {session ? (
        <>
          <h2 className="font-display text-[1.75rem] font-bold text-primary mb-4">{session.taskName}</h2>
          <p className="font-body text-sm text-on-surface/50 mb-4">
            {session.projectTitle} &middot; {session.duration}
          </p>
          <div className="bg-surface-container-low rounded-lg p-8 text-center">
            <p className="font-body text-on-surface/50">
              Detailed analytics for this session are coming soon.
            </p>
          </div>
        </>
      ) : (
        <p className="font-body text-on-surface/50">Session not found.</p>
      )}
    </div>
  );
}
