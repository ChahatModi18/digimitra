import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Compass,
  User,
  History,
} from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { fetchBusinesses } from "../../api/businesses";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, activeBusinessId, setActiveBusinessId } = useAuth();
  const { theme } = useTheme();

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const navItems = [
    { path: "/", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { path: "/businesses", label: t("navigation.businesses"), icon: Building2 },
    { path: "/assessment", label: t("navigation.assessment"), icon: ClipboardCheck },
    { path: "/recommendations", label: t("navigation.recommendations"), icon: Sparkles },
    { path: "/roadmap", label: t("navigation.roadmap"), icon: Compass },
    { path: "/history", label: t("navigation.history"), icon: History },
  ];

  return (
    <div className="min-h-screen flex bg-[#FDF8F3] text-[#241C15] antialiased">
      {/* 1. Desktop Sidebar (Section 5.4: 260px fixed width, white, right border) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-[#EDE2D8] fixed inset-y-0 left-0 z-40 shadow-sm">
        {/* Top Logo & Brand */}
        <div className="p-6 border-b border-[#EDE2D8]">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor: theme.primaryHex }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading text-[#241C15] tracking-tight">
                  DigiMitra
                </span>
              </div>
              <p className="text-[10px] text-[#9C8F84] font-medium leading-tight">
                AI Digital Consultant
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={
                  isActive
                    ? {
                        backgroundColor: theme.primaryLightHex,
                        color: theme.primaryHex,
                      }
                    : undefined
                }
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "font-bold shadow-xs"
                    : "text-[#6B5D52] hover:text-[#241C15] hover:bg-stone-50"
                }`}
              >
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={isActive ? { color: theme.primaryHex } : undefined}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Panel: Enterprise Switcher, Theme Switcher, Language & Account */}
        <div className="p-4 border-t border-[#EDE2D8] bg-stone-50/60 space-y-3">
          {businesses.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#9C8F84] tracking-wider block">
                Active Enterprise
              </label>
              <select
                value={activeBusinessId || ""}
                onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                className="w-full bg-white text-xs font-bold text-[#241C15] rounded-lg px-2.5 py-2 border border-[#EDE2D8] focus:outline-none focus:border-orange-500"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Theme Palette Switcher */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#9C8F84] tracking-wider block">
              MSME Color Theme
            </label>
            <ThemeSwitcher />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
            <LanguageSwitcher />

            <Link
              to="/auth"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#6B5D52] hover:text-[#241C15] px-2 py-1 rounded-lg hover:bg-white transition"
            >
              <User className="w-3.5 h-3.5" style={{ color: theme.primaryHex }} />
              <span className="truncate max-w-[80px]">
                {user ? user.full_name?.split(" ")[0] || "Account" : "Login"}
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-h-screen">
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-white border-b border-[#EDE2D8] shadow-xs">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
              style={{ backgroundColor: theme.primaryHex }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold font-heading text-[#241C15]">DigiMitra</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeSwitcher compact={true} />
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="p-2 rounded-lg font-semibold text-xs flex items-center gap-1"
              style={{
                backgroundColor: theme.primaryLightHex,
                color: theme.primaryHex,
              }}
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          {children}
        </main>

        {/* 3. Mobile Bottom Navigation (Section 5.5: Fixed bottom 64px) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-[#EDE2D8] flex items-center justify-around px-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={isActive ? { color: theme.primaryHex } : undefined}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition ${
                  isActive ? "font-bold" : "text-[#9C8F84] hover:text-[#6B5D52]"
                }`}
              >
                <Icon
                  className="h-5 w-5 mb-0.5"
                  style={isActive ? { color: theme.primaryHex } : undefined}
                />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
