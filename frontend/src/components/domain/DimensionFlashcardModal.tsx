import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Wrench,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  BookOpen,
  Globe,
  MessageCircle,
  FileSpreadsheet,
  CreditCard,
  Boxes,
  LineChart,
} from "lucide-react";
import { DIMENSION_FLASHCARDS, DimensionFlashcard } from "../../data/dimensionFlashcards";

interface DimensionFlashcardModalProps {
  initialDimensionCode: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang?: "en" | "hi";
}

export const DimensionFlashcardModal: React.FC<DimensionFlashcardModalProps> = ({
  initialDimensionCode,
  isOpen,
  onClose,
  currentLang = "en",
}) => {
  const dimensionKeys = Object.keys(DIMENSION_FLASHCARDS);
  const [selectedCode, setSelectedCode] = useState<string>(
    initialDimensionCode || dimensionKeys[0]
  );
  const [activeTab, setActiveTab] = useState<"overview" | "progression" | "tools" | "security">(
    "overview"
  );

  useEffect(() => {
    if (initialDimensionCode && DIMENSION_FLASHCARDS[initialDimensionCode]) {
      setSelectedCode(initialDimensionCode);
    }
  }, [initialDimensionCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedCode]);

  if (!isOpen) return null;

  const card: DimensionFlashcard =
    DIMENSION_FLASHCARDS[selectedCode] || DIMENSION_FLASHCARDS.infra;

  const currentIndex = dimensionKeys.indexOf(selectedCode);

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + dimensionKeys.length) % dimensionKeys.length;
    setSelectedCode(dimensionKeys[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % dimensionKeys.length;
    setSelectedCode(dimensionKeys[nextIdx]);
  };

  const getDimensionIcon = (dimCode: string) => {
    switch (dimCode.toLowerCase()) {
      case "infra":
        return <Smartphone className="w-6 h-6 text-orange-600" />;
      case "literacy":
        return <BookOpen className="w-6 h-6 text-sky-600" />;
      case "presence":
        return <Globe className="w-6 h-6 text-emerald-600" />;
      case "comms":
        return <MessageCircle className="w-6 h-6 text-teal-600" />;
      case "records":
        return <FileSpreadsheet className="w-6 h-6 text-amber-600" />;
      case "payments":
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case "inventory":
        return <Boxes className="w-6 h-6 text-purple-600" />;
      case "analytics":
        return <LineChart className="w-6 h-6 text-rose-600" />;
      case "growth":
        return <TrendingUp className="w-6 h-6 text-emerald-600" />;
      default:
        return <Smartphone className="w-6 h-6 text-orange-600" />;
    }
  };

  const title = currentLang === "hi" ? card.nameHi : card.nameEn;
  const tagline = currentLang === "hi" ? card.taglineHi : card.taglineEn;
  const description = currentLang === "hi" ? card.descriptionHi : card.descriptionEn;
  const expectedRoi = currentLang === "hi" ? card.expectedRoiHi : card.expectedRoiEn;
  const riskSecurity = currentLang === "hi" ? card.riskAndSecurityHi : card.riskAndSecurityEn;
  const quickAction = currentLang === "hi" ? card.quickActionHi : card.quickActionEn;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dimension-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
              {getDimensionIcon(card.code)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  {card.code.toUpperCase()} • {card.category}
                </span>
                <span className="text-[10px] font-semibold text-stone-500">
                  Weight: {card.weight}x
                </span>
              </div>
              <h3
                id="dimension-modal-title"
                className="text-lg sm:text-xl font-bold font-heading text-stone-900 tracking-tight"
              >
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrev}
              title="Previous Dimension (Left Arrow)"
              aria-label="Previous Dimension"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono font-bold text-stone-400">
              {currentIndex + 1} / {dimensionKeys.length}
            </span>
            <button
              onClick={handleNext}
              title="Next Dimension (Right Arrow)"
              aria-label="Next Dimension"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              title="Close modal (Esc)"
              aria-label="Close modal"
              className="p-2 ml-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Dimension Pill Selector */}
        <div className="px-4 sm:px-6 py-2 bg-stone-100/70 border-b border-stone-200/60 overflow-x-auto flex gap-1.5 scrollbar-thin">
          {dimensionKeys.map((key) => {
            const dim = DIMENSION_FLASHCARDS[key];
            const isSelected = key === selectedCode;
            return (
              <button
                key={key}
                onClick={() => setSelectedCode(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200/60"
                }`}
              >
                {currentLang === "hi" ? dim.nameHi.split(" ")[0] : dim.nameEn.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-4 sm:px-6 bg-white text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "अवलोकन व आरओआई" : "Overview & ROI"}</span>
          </button>
          <button
            onClick={() => setActiveTab("progression")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "progression"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "RBDL स्तर 0-3" : "RBDL Levels 0-3"}</span>
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "tools"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "डिजिटल टूल्स" : "Recommended Tools"}</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "security"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "सुरक्षा व सुझाव" : "Security & Quick Action"}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                <p className="text-xs sm:text-sm font-semibold text-orange-950 italic">
                  "{tagline}"
                </p>
                <p className="mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Expected ROI Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    {currentLang === "hi" ? "अपेक्षित लाभ व आरओआई (ROI)" : "Expected Business ROI"}
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-950 font-medium mt-0.5">
                    {expectedRoi}
                  </p>
                </div>
              </div>

              {/* Quick Action Suggestion */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    {currentLang === "hi" ? "शीघ्र करने योग्य कदम (Quick Action)" : "Immediate Next Step"}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium mt-0.5">
                    {quickAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progression" && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                {currentLang === "hi"
                  ? "इस आयाम में आपके व्यवसाय की डिजिटल परिपक्वता (RBDL 1.0) का विकास क्रम:"
                  : "How a business matures across this operational pillar from Level 0 to Level 3:"}
              </p>

              <div className="space-y-2.5">
                {/* Level 0 */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/80">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      Level 0: Traditional Manual
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {currentLang === "hi"
                      ? card.levelMilestones.level0Hi
                      : card.levelMilestones.level0En}
                  </p>
                </div>

                {/* Level 1 */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      Level 1: Basic Digitalized
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">
                    {currentLang === "hi"
                      ? card.levelMilestones.level1Hi
                      : card.levelMilestones.level1En}
                  </p>
                </div>

                {/* Level 2 */}
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-900">
                      Level 2: Integrated Operations
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">
                    {currentLang === "hi"
                      ? card.levelMilestones.level2Hi
                      : card.levelMilestones.level2En}
                  </p>
                </div>

                {/* Level 3 */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                      Level 3: Strategic & Omnichannel
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">
                    {currentLang === "hi"
                      ? card.levelMilestones.level3Hi
                      : card.levelMilestones.level3En}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 font-medium">
                {currentLang === "hi"
                  ? "इस आयाम के लिए अनुशंसित उपकरण और सॉफ्टवेयर:"
                  : "Common and verified software solutions used by Indian MSMEs for this pillar:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {card.recommendedTools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-orange-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{tool.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tool.freeTier
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {tool.freeTier ? "Free / Low Cost" : "Commercial"}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1">{tool.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    {currentLang === "hi" ? "साइबर सुरक्षा व सतर्कता" : "Cybersecurity & Risk Prevention"}
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-950 font-medium mt-1">
                    {riskSecurity}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed">
                <p className="font-semibold text-stone-800 mb-1">
                  {currentLang === "hi" ? "डिजीमित्र शोध टिप्पणी:" : "DigiMitra Research Note:"}
                </p>
                {currentLang === "hi"
                  ? "प्रत्येक डिजिटल उपकरण को अपनाने के साथ-साथ बैकअप और ओटीपी सुरक्षा के बुनियादी नियमों का पालन करना अनिवार्य है। बिना बैकअप का डिजिटल लेजर फोन चोरी होने पर गंभीर नुकसान पहुंचा सकता है।"
                  : "Adopting digital tools without basic backup and password discipline increases business fragility. Always maintain automated daily cloud backups and separate business banking credentials."}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500 text-center sm:text-left">
            {currentLang === "hi"
              ? "14 प्रश्नों का मूल्यांकन देकर अपना स्कोर जांचें"
              : "Discover your exact readiness score in 3 minutes"}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 border border-stone-200 transition"
            >
              {currentLang === "hi" ? "बंद करें" : "Close"}
            </button>
            <Link
              to="/assessment"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-1.5"
            >
              <span>{currentLang === "hi" ? "मूल्यांकन शुरू करें" : "Start Assessment"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
