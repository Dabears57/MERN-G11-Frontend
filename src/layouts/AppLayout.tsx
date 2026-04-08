import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';
import SessionFloatingWidget from '../components/SessionFloatingWidget.tsx';
import { ActiveSessionProvider, useActiveSessionContext } from '../contexts/ActiveSessionContext.tsx';

const SIDEBAR_WIDTH = 228;
const CONTENT_PADDING = 40; // px-10

function AppLayoutInner() {
  const location = useLocation();
  const { info } = useActiveSessionContext();

  // Widget is only shown on pages other than sessions (sessions manages its own session UI)
  const showWidget = location.pathname !== '/sessions' && info.status !== 'no active session';

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main
        style={{ paddingLeft: SIDEBAR_WIDTH + CONTENT_PADDING, paddingRight: CONTENT_PADDING }}
        className="min-h-screen py-10"
      >
        {/* Content is naturally left-aligned after sidebar offset; max-width keeps it readable on wide screens */}
        <div className="max-w-[1060px]">
          <Outlet />
        </div>
      </main>

      {showWidget && <SessionFloatingWidget info={info} />}
    </div>
  );
}

export default function AppLayout() {
  return (
    <ActiveSessionProvider>
      <AppLayoutInner />
    </ActiveSessionProvider>
  );
}
