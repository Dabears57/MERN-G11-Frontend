import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects.ts';

export default function InsightProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { getProject } = useProjects();
  const project = getProject(id ?? '');

  return (
    <div>
      <Link to="/insights" className="font-body text-sm text-on-surface/50 hover:text-primary mb-4 inline-block">
        &larr; Back to Insights
      </Link>
      <h1 className="font-display text-[3.5rem] font-bold text-on-surface mb-2">
        Project Insights
      </h1>
      {project ? (
        <>
          <h2 className="font-display text-[1.75rem] font-bold text-primary mb-4">{project.title}</h2>
          <div className="bg-surface-container-low rounded-lg p-8 text-center">
            <p className="font-body text-on-surface/50">
              Detailed analytics for this project are coming soon.
            </p>
          </div>
        </>
      ) : (
        <p className="font-body text-on-surface/50">Project not found.</p>
      )}
    </div>
  );
}
