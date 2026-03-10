import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContextHooks";
import Loading from "../Ui/Loading";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsPending(true);
    const result = await register(username.trim(), email.trim(), password);

    if (result.success) {
      setIsSuccess(true);
      setMessage("Account created successfully. Redirecting...");
      navigate("/");
    } else {
      setMessage(result.message || "Registration failed");
    }

    setIsPending(false);
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_85%_15%,#FAD7A1_0%,transparent_42%),radial-gradient(circle_at_8%_82%,#BFD9FF_0%,transparent_40%),linear-gradient(150deg,#F9F3EB_0%,#EAF4FF_48%,#EAFBF1_100%)] px-4 py-8"
      style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-25px_rgba(40,56,80,0.35)] backdrop-blur md:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#122032] p-10 text-slate-100 md:flex md:flex-col md:justify-between">
          <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-lime-300/15 blur-2xl" />

          <div className="relative">
            <p className="inline-flex rounded-full border border-sky-200/35 px-3 py-1 text-xs tracking-[0.22em] text-sky-100/90 uppercase">
              FUTURE CRM
            </p>
            <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight text-balance">
              Build your sales command center in minutes.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Create your account and start organizing leads, notes, and
              follow-ups with a workflow that stays focused.
            </p>
          </div>

          <div className="relative grid gap-3 text-sm text-slate-300">
            <p className="rounded-xl border border-slate-700/70 bg-slate-900/45 px-4 py-3">
              "The fastest way to improve conversions is consistent follow-up."
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">
                Get Started
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Set up your profile to access your CRM dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Username
                </span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
                />
              </label>

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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Confirm password
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-300/40"
                />
              </label>

              {message && (
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-12 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? <Loading size="sm" /> : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-900 underline decoration-2 underline-offset-4 hover:text-slate-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
