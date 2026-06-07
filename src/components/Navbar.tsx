import { Compass, LogOut, Plus, ShieldAlert } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onShareClick: () => void;
}

export default function Navbar({ user, onLogin, onLogout, onShareClick }: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div id="header-brand" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 id="header-brand-title" className="font-display text-lg font-bold tracking-tight text-slate-900">
                Sarad's Civil Help
              </h1>
              <span id="header-sub" className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block -mt-1 font-mono">
                Learning & Exam Hub
              </span>
            </div>
          </div>

          {/* Action Menus */}
          <div id="header-actions" className="flex items-center gap-3">
            {user ? (
              <>
                {/* Share Material Trigger Button */}
                <button
                  id="btn-header-share"
                  onClick={onShareClick}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Notes</span>
                </button>

                {/* Profile Widget */}
                <div id="header-user-badge" className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg max-w-[200px] sm:max-w-xs">
                  {user.photoURL ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={user.photoURL}
                      alt={user.displayName || 'Contributor'}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {(user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                      {user.displayName?.split(' ')[0] || 'Engineer'}
                    </p>
                  </div>
                  
                  {/* Sign Out Trigger */}
                  <button
                    id="btn-signout"
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                id="btn-signin-google"
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                {/* Google Multi-colored representation */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
