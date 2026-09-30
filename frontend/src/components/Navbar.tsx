import React, { useState } from "react";
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
  Search,
  Menu,
  X,
  HelpCircle,
  Share2,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { ShareModal } from "./ui/ShareModal";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const navItems = [
    { path: "/", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { path: "/businesses", label: t("navigation.businesses"), icon: Building2 },
    { path: "/assessment", label: t("navigation.assessment"), icon: ClipboardCheck },
    { path: "/recommendations", label: t("navigation.recommendations"), icon: Sparkles },
    { path: "/roadmap", label: t("navigation.roadmap"), icon: Compass },
    { path: "/history", label: t("navigation.history"), icon: History },
    { path: "/explore", label: t("navigation.explore"), icon: Search },
    {
      path: "/contact",
      label: currentLang === "hi" ? "संपर्क व प्रश्न" : "Contact & FAQs",
      icon: HelpCircle,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-heading text-stone-900 tracking-tight">DigiMitra</span>
              <span className="text-[10px] uppercase font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                RBDL v1.0
              </span>
            </div>
            <p className="text-[10px] text-stone-500 hidden sm:block">AI Digital Consultant for Indian MSMEs</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-bold border border-orange-200/80 shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            title={currentLang === "hi" ? "डिजीमित्र साझा करें" : "Share DigiMitra"}
            aria-label="Share DigiMitra"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5 text-orange-600" />
            <span className="hidden md:inline">
              {currentLang === "hi" ? "साझा करें" : "Share"}
            </span>
          </button>

          <LanguageSwitcher />

          {/* User Account / Login Button */}
          <Link
            to="/auth"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              user
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold shadow-xs"
                : "bg-orange-600 hover:bg-orange-500 text-white border-transparent shadow-md shadow-orange-600/20"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {user ? user.full_name?.split(" ")[0] || "Account" : t("auth.login_button")}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-1.5 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Universal Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="DigiMitra MSME Digital Consultant"
        description="Free diagnostic assessment, 9-dimension maturity classification, and customized roadmaps for Indian local businesses."
        shareUrl={window?.location?.origin || "http://localhost:5173"}
        currentLang={currentLang}
      />
    </header>
  );
};
