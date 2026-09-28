import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  MapPin,
  Sparkles,
  Building2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  CreditCard,
  FileSpreadsheet,
  Globe,
  Megaphone,
  GraduationCap,
  Server,
  ShieldCheck,
  X,
  Compass,
} from "lucide-react";
import {
  fetchDiscoveryCategories,
  searchServices,
  DiscoveryCategory,
} from "../api/discovery";
import { fetchBusinesses } from "../api/businesses";
import { Business } from "../types";
import { ServiceDiscoveryCard } from "../components/domain/ServiceDiscoveryCard";
import { INDIAN_STATES_AND_UTS } from "../data/msmeTaxonomy";
import { Button } from "../components/ui/Button";

export const ExploreView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>(undefined);
  const [includeMockTest, setIncludeMockTest] = useState<boolean>(false);

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat !== null) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch registered businesses for context selection
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["userBusinesses"],
    queryFn: fetchBusinesses,
  });

  // Auto-select first business if available
  useEffect(() => {
    if (businesses.length > 0 && selectedBusinessId === undefined) {
      const first = businesses[0];
      setSelectedBusinessId(first.id);
      if (first.state && !selectedState) {
        setSelectedState(first.state);
      }
      if (first.district && !selectedDistrict) {
        setSelectedDistrict(first.district);
      }
    }
  }, [businesses, selectedBusinessId]);

  // Fetch categories
  const { data: categories = [] } = useQuery<DiscoveryCategory[]>({
    queryKey: ["discoveryCategories"],
    queryFn: fetchDiscoveryCategories,
  });

  // Search services query
  const {
    data: searchResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "searchServices",
      selectedCategory,
      searchTerm,
      selectedState,
      selectedDistrict,
      selectedBusinessId,
      includeMockTest,
    ],
    queryFn: () =>
      searchServices({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        business_id: selectedBusinessId,
        test_mock: includeMockTest,
      }),
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return <CreditCard className="w-4 h-4" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "Globe":
        return <Globe className="w-4 h-4" />;
      case "Megaphone":
        return <Megaphone className="w-4 h-4" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4" />;
      case "Building2":
        return <Building2 className="w-4 h-4" />;
      case "Server":
        return <Server className="w-4 h-4" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setSelectedState("");
    setSelectedDistrict("");
    setSearchParams({});
  };

  const handleCategoryClick = (catId: string) => {
    const next = selectedCategory === catId ? "" : catId;
    setSelectedCategory(next);
    if (next) {
      setSearchParams({ category: next });
    } else {
      setSearchParams({});
    }
  };

  const suggestedCats = searchResponse?.suggested_categories || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. Hero / Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/70 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "स्थान-आधारित डिजिटल सेवा खोज" : "Localized Service Discovery"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-heading leading-tight">
            {t("explore.title")}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            {t("explore.subtitle")}
          </p>
        </div>

        {/* Enterprise Context Selector */}
        {businesses.length > 0 && (
          <div className="mt-6 pt-4 border-t border-orange-200/50 flex items-center gap-3 flex-wrap text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              {t("explore.select_business_prompt")}
            </span>
            <select
              value={selectedBusinessId || ""}
              onChange={(e) => {
                const bId = Number(e.target.value);
                setSelectedBusinessId(bId);
                const b = businesses.find((item) => item.id === bId);
                if (b?.state) setSelectedState(b.state);
                if (b?.district) setSelectedDistrict(b.district);
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 font-bold focus:outline-none focus:border-orange-500 shadow-xs"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || b.business_name} ({b.city || b.district || b.state})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Assessment Focus Suggestion Banner */}
      {suggestedCats.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-amber-900 block">
                {t("explore.suggested_badge")}
              </span>
              <p className="text-stone-600 leading-tight">
                {t("explore.suggested_desc")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {suggestedCats.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <button
                  key={catId}
                  onClick={() => handleCategoryClick(catId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    selectedCategory === catId
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {getCategoryIcon(cat.icon_name)}
                  <span>{currentLang === "hi" ? cat.name_hi : cat.name_en}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Search & Location Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("explore.search_placeholder")}
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* State Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
            >
              <option value="">{t("explore.filter_state")}</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st.code} value={st.nameEn}>
                  {currentLang === "hi" ? st.nameHi : st.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* District / City Input */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              placeholder={t("explore.filter_district")}
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* 4. Category Filter Chips */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {currentLang === "hi" ? "श्रेणी अनुसार खोजें" : "Filter by Category"}
            </span>

            {(selectedCategory || searchTerm || selectedState || selectedDistrict) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t("explore.clear_filters")}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === ""
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {t("explore.all_categories")}
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isSelected
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  {getCategoryIcon(cat.icon_name)}
                  <span>{currentLang === "hi" ? cat.name_hi : cat.name_en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Results Section */}
      <div className="space-y-4">
        {/* Results Header with Mock Toggle (for test mode) */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span className="font-semibold">
            {isLoading
              ? t("common.loading")
              : `${searchResponse?.total_count || 0} ${
                  currentLang === "hi" ? "सेवाएं उपलब्ध" : "services available"
                }`}
          </span>

          <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-stone-500 hover:text-stone-800">
            <input
              type="checkbox"
              checked={includeMockTest}
              onChange={(e) => setIncludeMockTest(e.target.checked)}
              className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <span>{currentLang === "hi" ? "परीक्षण डेटा देखें (Mock Mode)" : "Simulate Mock Data"}</span>
          </label>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-stone-200 animate-pulse space-y-4"
              >
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-6 bg-stone-200 rounded w-3/4" />
                <div className="h-12 bg-stone-100 rounded w-full" />
                <div className="h-8 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="text-base font-bold text-rose-950">
              {currentLang === "hi"
                ? "सेवाएं लोड करने में समस्या आई"
                : "Unable to load discovery services"}
            </h4>
            <p className="text-xs text-rose-700">
              {currentLang === "hi"
                ? "कृपया पुनः प्रयास करें।"
                : "Please try again or adjust your search filter."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t("common.retry")}
            </Button>
          </div>
        )}

        {/* Empty State / Unconfigured State */}
        {!isLoading && !isError && searchResponse?.items.length === 0 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-stone-900">
                {t("explore.empty_title")}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {searchResponse?.provider_message_en || t("explore.empty_desc")}
              </p>
            </div>

            {/* Official Support Resources Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2 text-left">
              <a
                href="https://udyamregistration.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition group flex flex-col justify-between space-y-2"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-700 block">
                    Govt. of India
                  </span>
                  <h5 className="font-bold text-stone-900 text-sm group-hover:text-orange-600 transition">
                    Udyam Registration & Assist Portal
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Free official MSME certificate, priority sector banking, and subsidy eligibility.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 pt-1">
                  <span>Visit Udyam</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              <a
                href="https://msme.gov.in/district-industries-centres"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition group flex flex-col justify-between space-y-2"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                    Ministry of MSME
                  </span>
                  <h5 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition">
                    District Industries Centres (DIC)
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1">
                    District-level government counseling, PMEGP credit assistance, and local schemes.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 pt-1">
                  <span>Locate DIC</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                {t("explore.clear_filters")}
              </Button>
            </div>
          </div>
        )}

        {/* Service Cards Grid */}
        {!isLoading && !isError && (searchResponse?.items.length || 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResponse?.items.map((item) => (
              <ServiceDiscoveryCard
                key={item.id}
                item={item}
                currentLang={currentLang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
