import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewReceiptPage from './pages/NewReceiptPage';
import ReceiptViewPage from './pages/ReceiptViewPage';
import PartsPage from './pages/PartsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><AppShell /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="receipts/new" element={<NewReceiptPage />} />
        <Route path="receipts/:id/edit" element={<NewReceiptPage />} />
        <Route path="receipts/:id" element={<ReceiptViewPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
