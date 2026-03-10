import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    to: "/",
    description: "Overview and activity",
  },
  {
    label: "Leads",
    to: "/leads",
    description: "Pipeline and follow-ups",
  },
  {
    label: "Settings",
    to: "/settings",
    description: "Preferences and account",
  },
];

const linkClassName = ({ isActive }) =>
  `group rounded-2xl border px-4 py-3 transition ${
    isActive
      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
      : "border-transparent bg-white/10 text-slate-300 hover:border-white/10 hover:bg-white/15 hover:text-white"
  }`;

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/45 transition lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[86vw] flex-col bg-[#0f172a] px-5 py-5 text-slate-100 shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">
              Workspace
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
              Future CRM
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <nav className="mt-6 grid gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={linkClassName}
              onClick={onClose}
            >
              {({ isActive }) => (
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? "text-white" : "text-inherit"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl border border-sky-300/15 bg-linear-to-br from-sky-400/10 to-emerald-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">
            Daily Focus
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            Keep the pipeline active with steady follow-ups, clear priorities,
            and fast status updates.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
