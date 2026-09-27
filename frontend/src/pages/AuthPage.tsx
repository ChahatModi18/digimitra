import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "../components/UIState";

export const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, register, demoLogin, logout, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("business_owner");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate("/businesses");
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone_number: phone || undefined,
        role,
      });
      navigate("/businesses");
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. Email may already be in use.");
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    try {
      await demoLogin();
      navigate("/businesses");
    } catch (err: any) {
      setErrorMsg("Demo login failed. Backend may be offline.");
    }
  };

  // If already authenticated, show account profile summary
  if (user) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6 animate-fadeIn">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xl">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">{user.full_name}</h2>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
              {user.role?.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">
                User Account ID
              </span>
              <span className="font-mono text-white text-sm">#{user.id}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">
                Active Session
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Secure JWT Active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate("/businesses")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Go to My Enterprises</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("auth.logout")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-6 animate-fadeIn">
      {/* Auth Container */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            {mode === "login" ? t("auth.login_title") : t("auth.register_title")}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === "login" ? t("auth.login_desc") : t("auth.register_desc")}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t("auth.login_button")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === "register"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t("auth.register_title")}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && <ErrorAlert message={errorMsg} />}

        {/* 1-Click Quick Demo Sign In */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t("auth.demo_button")}</span>
          </button>
          <p className="text-[11px] text-slate-400">{t("auth.demo_hint")}</p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Or Sign In With Email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("auth.full_name")} *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("auth.phone")}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 text-white text-xs rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("auth.role")}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl px-3.5 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="business_owner">{t("auth.role_owner")}</option>
                  <option value="consultant">{t("auth.role_consultant")}</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("auth.email")} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.in"
                className="w-full bg-slate-950 text-white text-xs rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("auth.password")} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 text-white text-xs rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isLoading
              ? "Authenticating..."
              : mode === "login"
              ? t("auth.login_button")
              : t("auth.register_button")}
          </button>
        </form>
      </div>
    </div>
  );
};
