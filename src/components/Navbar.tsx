import { Compass, LogOut, Moon, Plus, Sun, Info } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onShareClick: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onAboutClick?: () => void; // Optional callback for the About button action
}

export default function Navbar({ 
  user, 
  onLogin, 
  onLogout, 
  onShareClick, 
  dark, 
  onToggleDark,
  onAboutClick 
}: NavbarProps) {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Height increased from h-14 to h-16 (~1.2x scale) */}
        <div className="flex items-center justify-between h-16">

          {/* Brand & Navigation */}
          <div className="flex items-center gap-6">
            <div id="header-brand" className="flex items-center gap-3">
              {/* Icon container scaled up */}
              <div className="w-9 h-9 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <div>
                {/* Title and label text size scaled up proportionally */}
                <h1
                  id="header-brand-title"
                  className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Sarad's Civil Help
                </h1>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mt-1">
                  Learning & Exam Hub
                </span>
              </div>
            </div>

            {/* Flat Minimalist About Us Navigation Trigger */}
            <button
              onClick={onAboutClick}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>About Us</span>
            </button>
          </div>

          {/* Actions */}
          <div id="header-actions" className="flex items-center gap-2.5">

            {/* Mobile About Us Icon Trigger */}
            <button
              onClick={onAboutClick}
              title="About Us"
              className="flex sm:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Info className="w-[18px] h-[18px]" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {user ? (
              <>
                <button
                  id="btn-header-share"
                  onClick={onShareClick}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Share Notes</span>
                </button>

                <div
                  id="header-user-badge"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg"
                >
                  {user.photoURL ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-[22px] h-[22px] rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-[22px] h-[22px] rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                      {(user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[90px]">
                    {user.displayName?.split(' ')[0] || 'Engineer'}
                  </span>
                  <button
                    id="btn-signout"
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                id="btn-signin-google"
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}