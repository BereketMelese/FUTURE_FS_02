import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContextHooks";
import Loading from "../Ui/Loading";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsPending(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setMessage(result.message || "Login failed");
    }

    setIsPending(false);
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#F8E7CF_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#C9D8FF_0%,transparent_40%),linear-gradient(145deg,#F4EFE7_0%,#E8F2FF_45%,#EDF8F0_100%)] px-4 py-8"
      style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-25px_rgba(40,56,80,0.35)] backdrop-blur md:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#0E1B2D] p-10 text-slate-100 md:flex md:flex-col md:justify-between">
          <div className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="absolute -right-14 bottom-8 h-60 w-60 rounded-full bg-emerald-300/20 blur-2xl" />

          <div className="relative">
            <p className="inline-flex rounded-full border border-cyan-200/40 px-3 py-1 text-xs tracking-[0.22em] text-cyan-100/90 uppercase">
              FUTURE CRM
            </p>
            <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight text-balance">
              Log in and bring your pipeline back to life.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Track high-value leads, close faster, and keep your sales rhythm
              sharp with one clean dashboard.
            </p>
          </div>

          <div className="relative grid gap-3 text-sm text-slate-300">
            <p className="rounded-xl border border-slate-700/70 bg-slate-900/50 px-4 py-3">
              "A smooth login experience sets the tone for the entire workflow."
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">
                Welcome Back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your email and password to continue to your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
                />
              </label>

              {message && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-12 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? <Loading size="sm" /> : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              New here?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-900 underline decoration-2 underline-offset-4 hover:text-slate-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
