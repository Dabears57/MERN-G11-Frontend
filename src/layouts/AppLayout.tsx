import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main className="max-w-[1320px] mx-auto px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}
