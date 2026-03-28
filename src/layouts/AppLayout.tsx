import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';

const SIDEBAR_WIDTH = 228;
const CONTENT_PADDING = 40; // px-10

export default function AppLayout() {
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
    </div>
  );
}
