import { useEffect, useState } from "react";
import { useAuth } from "../hooks/authContextHooks";

const storageKey = "future-crm-preferences";

const defaultPreferences = {
  emailUpdates: true,
  compactDashboard: false,
  showFollowUpAlerts: true,
};

const preferenceLabels = {
  emailUpdates: {
    title: "Email updates",
    description: "Receive product and activity updates in your inbox.",
  },
  compactDashboard: {
    title: "Compact dashboard",
    description: "Prefer denser cards and tighter spacing in overview screens.",
  },
  showFollowUpAlerts: {
    title: "Follow-up alerts",
    description: "Highlight leads that need attention as deadlines approach.",
  },
};

const Settings = () => {
  const { user, token, logout } = useAuth();
  const [preferences, setPreferences] = useState(() => {
    const storedPreferences = localStorage.getItem(storageKey);

    if (!storedPreferences) {
      return defaultPreferences;
    }

    try {
      const parsedPreferences = JSON.parse(storedPreferences);
      return { ...defaultPreferences, ...parsedPreferences };
    } catch {
      localStorage.removeItem(storageKey);
      return defaultPreferences;
    }
  });
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!savedMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSavedMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const handlePreferenceChange = (key) => {
    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(nextPreferences);
    localStorage.setItem(storageKey, JSON.stringify(nextPreferences));
    setSavedMessage("Preferences saved locally.");
  };

  const sessionStatus = token ? "Active" : "Unavailable";
  const maskedToken = token
    ? `${token.slice(0, 12)}...${token.slice(-6)}`
    : "No token";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#172554_55%,#0f766e_145%)] p-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.82)] lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/90">
            Settings
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Account, workspace preferences, and session visibility.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            This page reflects the user fields your backend currently exposes
            and adds client-side workspace settings that persist locally.
          </p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Signed in user
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {user?.username || "Unknown user"}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {user?.email || "No email available"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-slate-300">Session</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {sessionStatus}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-slate-300">User ID</p>
              <p className="mt-2 truncate text-sm font-semibold text-white">
                {user?.id || "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Profile</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Account information
          </h3>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Username
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user?.username || "Not available"}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Email
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Backend support
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your current API exposes identity data, but it does not yet
                provide endpoints to update profile details or change passwords
                from this screen.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Preferences</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Local workspace controls
              </h3>
            </div>
            {savedMessage && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {savedMessage}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {Object.entries(preferenceLabels).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{value.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {value.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePreferenceChange(key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    preferences[key] ? "bg-slate-900" : "bg-slate-300"
                  }`}
                  aria-pressed={preferences[key]}
                  aria-label={value.title}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                      preferences[key] ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Security</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Current session details
          </h3>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Auth token
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-700">
                {maskedToken}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              Your backend currently issues a JWT that expires after one hour.
              If you want editable security controls here, the next step is
              adding password update and session revocation endpoints.
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Actions</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Session controls
          </h3>

          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Logging out clears the current token from local storage and returns
            the app to an unauthenticated state.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(storageKey);
                setPreferences(defaultPreferences);
                setSavedMessage("Preferences reset.");
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Reset local preferences
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Settings;
