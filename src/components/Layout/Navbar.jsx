import { useAuth } from "../../hooks/authContextHooks";

const Navbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
            aria-label="Open navigation"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Future CRM
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm sm:block">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Signed in as
            </p>
            <p className="max-w-44 truncate text-sm font-semibold text-slate-800">
              {user?.username || user?.email || "Team Member"}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
