
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const success = login(username, password);

    if (success) {
      navigate('/', { replace: true });
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 px-4 py-6 sm:px-6 flex items-center justify-center">

      <div className="w-full max-w-sm">

        {/* LOGIN CARD */}
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-lg sm:p-8">

          {/* LOGO */}
          <div className="mb-5 flex justify-center sm:mb-6">
            <img
              src="/assets/mr-transmission-logo.png"
              alt="Mr. Transmission"
              className="h-auto w-44 max-w-full object-contain sm:w-52"
            />
          </div>

          {/* TITLE */}
          <div className="mb-6 text-center sm:mb-7">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Receipt Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
          >

            {/* USERNAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Username"
                  autoComplete="username"
                  required
                  className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          {/* FOOTER */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center sm:mt-6 sm:pt-5">
            <p className="text-xs text-slate-400">
              Authorized Access Only
            </p>
          </div>

        </div>

        {/* BOTTOM TEXT */}
        <p className="mt-4 px-2 text-center text-[11px] leading-5 text-slate-400 sm:text-xs">
          Transmission Receipt Management System
        </p>

      </div>
    </div>
  );
}
