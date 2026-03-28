import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AppLayout from './layouts/AppLayout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProjectsPage from './pages/ProjectsPage.tsx';
import ProjectDetailPage from './pages/ProjectDetailPage.tsx';
import SessionsPage from './pages/SessionsPage.tsx';
import InsightsPage from './pages/InsightsPage.tsx';
import InsightProjectPage from './pages/InsightProjectPage.tsx';
import InsightSessionPage from './pages/InsightSessionPage.tsx';
import AccountPage from './pages/AccountPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/project/:id" element={<InsightProjectPage />} />
            <Route path="/insights/session/:id" element={<InsightSessionPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
