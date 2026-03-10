import { useState, useEffect, useMemo } from "react";
import {
  signIn as loginApi,
  signUp as signUpApi,
  fetchUserApi as fetchUserApi,
} from "../services/api";
import { AuthContext } from "../hooks/authContextHooks";
import Loading from "../components/Ui/Loading";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchUser = async () => {
      try {
        const res = await fetchUserApi(token);
        setUser(res.data.user);
      } catch {
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await signUpApi({ username, email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [user, token],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),radial-gradient(circle_at_bottom_right,#fde68a_0%,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_52%,#f8fafc_100%)]">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/80 px-8 py-7 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
          <Loading size="lg" />
          <p className="text-sm font-medium text-slate-600">
            Restoring your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
