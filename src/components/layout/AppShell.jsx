import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Settings,
  PackageSearch,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'bg-black text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  const handleLogout = () => {
    // مسح بيانات تسجيل الدخول
    logout();

    // الرجوع لصفحة تسجيل الدخول
    nav('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-6">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => nav('/')}
            className="flex items-center gap-3"
          >
            <img
              src="/assets/mr-transmission-logo.png"
              alt="Mr. Transmission"
              className="h-10 w-auto object-contain"
            />

            <span className="hidden xl:block text-xs font-black tracking-widest text-slate-400">
              RECEIPT MANAGER
            </span>
          </button>

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1">

            <NavLink to="/" end className={link}>
              <ClipboardList size={17} />
              Receipts
            </NavLink>

            <NavLink to="/parts" className={link}>
              <PackageSearch size={17} />
              Parts
            </NavLink>

            {user?.role === 'admin' && (
              <NavLink to="/settings" className={link}>
                <Settings size={17} />
                Settings
              </NavLink>
            )}

          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            {/* NEW RECEIPT */}
            <button
              type="button"
              onClick={() => nav('/receipts/new')}
              className="btn-primary"
            >
              <Plus size={17} />
              New Receipt
            </button>

            {/* SIGN OUT */}
            <button
              type="button"
              title="Sign out"
              onClick={handleLogout}
              className="icon-btn"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1500px] px-4 py-6 lg:px-6 print:p-0">
        <Outlet />
      </main>

    </div>
  );
}
