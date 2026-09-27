import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Sparkles,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  Button,
  Input,
  Badge,
  Alert,
} from "../components";

export const AuthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const navigate = useNavigate();
  const { user, login, register, demoLogin, logout, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role] = useState("business_owner");
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
        <Card variant="default" className="p-8 sm:p-10 space-y-6 border-orange-200 shadow-card bg-gradient-to-br from-white via-orange-50/20 to-white">
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 font-heading">{user.full_name}</h2>
                <span className="text-xs text-stone-500 font-medium">{user.email}</span>
              </div>
            </div>

            <Badge variant="success" size="md" dot>
              {user.role === "business_owner" ? "Business Owner" : user.role}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium block">Account Status</span>
              <span className="font-extrabold text-emerald-700 mt-1 block">Active Verified</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium block">Registered Mobile</span>
              <span className="font-bold text-stone-800 mt-1 block">
                {user.phone_number || "Not provided"}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-stone-200">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/businesses")}
              leftIcon={<Building2 className="w-4 h-4" />}
              className="shadow-orange-glow"
            >
              My Enterprises
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 space-y-6 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 mx-auto flex items-center justify-center shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading tracking-tight">
          {mode === "login" ? t("auth.login_title") : t("auth.register_title")}
        </h1>
        <p className="text-xs text-stone-500">
          {mode === "login" ? t("auth.login_desc") : t("auth.register_desc")}
        </p>
      </div>

      {errorMsg && (
        <Alert type="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Auth Card */}
      <Card variant="default" className="p-6 sm:p-8 space-y-6 border-stone-200 shadow-card">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === "login"
                ? "bg-white text-orange-600 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t("auth.login_tab")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === "register"
                ? "bg-white text-orange-600 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t("auth.register_tab")}
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label={t("auth.email")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@enterprise.in"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label={t("auth.password")}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-orange-glow"
            >
              {t("auth.login_button")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Input
              label={`${t("auth.full_name")} *`}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ramesh Kumar Sharma"
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label={`${t("auth.email")} *`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@enterprise.in"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label={t("auth.phone")}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label={`${t("auth.password")} *`}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full shadow-orange-glow"
            >
              {t("auth.register_button")}
            </Button>
          </form>
        )}

        {/* Demo Fast-Login Option */}
        <div className="pt-4 border-t border-stone-200 space-y-3 text-center">
          <span className="text-[11px] text-stone-500 block font-medium">
            {currentLang === "hi" ? "त्वरित मूल्यांकन हेतु:" : "For quick demonstration testing:"}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleDemoLogin}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-orange-600" />}
            className="w-full"
          >
            {t("auth.demo_button")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
