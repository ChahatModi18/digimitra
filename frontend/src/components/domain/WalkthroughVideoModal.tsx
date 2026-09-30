import React, { useRef } from "react";
import {
  X,
  Play,
  Film,
  Layers,
  Compass,
  Building2,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface WalkthroughVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: "en" | "hi";
}

export const WalkthroughVideoModal: React.FC<WalkthroughVideoModalProps> = ({
  isOpen,
  onClose,
  currentLang = "en",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const chapters = [
    { time: 0, titleEn: "1. Enterprise Registration", titleHi: "1. उद्यम पंजीकरण" },
    { time: 6, titleEn: "2. 9-Dimension Assessment", titleHi: "2. 9-आयाम मूल्यांकन" },
    { time: 14, titleEn: "3. RBDL Maturity Level", titleHi: "3. डिजिटल परिपक्वता स्तर" },
    { time: 22, titleEn: "4. Phased Roadmap Execution", titleHi: "4. चरणबद्ध रोडमैप क्रियान्वयन" },
    { time: 32, titleEn: "5. Government Schemes & FAQs", titleHi: "5. सरकारी योजनाएं व सहायता" },
  ];

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#EDE2D8] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2D8] bg-gradient-to-r from-[#FFF4ED] to-[#FAF1E8]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F0592A] text-white shadow-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#241C15]">
                  {currentLang === "hi"
                    ? "DigiMitra उपयोग मार्गदर्शिका (Video Walkthrough)"
                    : "How DigiMitra Works — Interactive Video Guide"}
                </h2>
                <Badge variant="brand" size="sm">
                  User Guide
                </Badge>
              </div>
              <p className="text-xs text-[#6B5D52]">
                {currentLang === "hi"
                  ? "देखें कि डिजिटल मूल्यांकन से लेकर व्यक्तिगत रोडमैप तक सिस्टम कैसे काम करता है।"
                  : "Watch the step-by-step user journey from diagnostic assessment to phased action milestones."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/60 text-[#6B5D52] hover:text-[#241C15] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="bg-black relative aspect-video w-full flex items-center justify-center max-h-[52vh]">
          <video
            ref={videoRef}
            src="/digimitra_user_walkthrough.webm"
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support WebM video playback.
          </video>
        </div>

        {/* Interactive Chapters & Explanations */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-stone-50/50">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#9C8F84] tracking-wider block mb-2">
              {currentLang === "hi" ? "वीडियो अध्याय (क्लिक कर सीधे जाएं)" : "Quick Jump Chapters:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {chapters.map((chap, i) => (
                <button
                  key={i}
                  onClick={() => seekTo(chap.time)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#FFF4ED] text-[#241C15] hover:text-[#F0592A] border border-[#EDE2D8] hover:border-[#F0592A] flex items-center gap-1.5 shadow-xs transition"
                >
                  <Play className="w-3 h-3 text-[#F0592A] fill-[#F0592A]" />
                  <span>{currentLang === "hi" ? chap.titleHi : chap.titleEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key Workflow Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200/80">
            <div className="p-3 bg-white rounded-xl border border-[#EDE2D8] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0592A]">
                <Building2 className="w-4 h-4" />
                <span>1. Multi-Enterprise Setup</span>
              </div>
              <p className="text-[11px] text-[#6B5D52] leading-tight">
                Profile your business type, scale, revenue, and location to tailor recommendations.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EDE2D8] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B7A6E]">
                <Layers className="w-4 h-4" />
                <span>2. 9 Operational Dimensions</span>
              </div>
              <p className="text-[11px] text-[#6B5D52] leading-tight">
                Evaluates infrastructure, bookkeeping, customer channels, and supply chains objectively.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EDE2D8] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C88A1D]">
                <Compass className="w-4 h-4" />
                <span>3. Phased 3-Stage Roadmap</span>
              </div>
              <p className="text-[11px] text-[#6B5D52] leading-tight">
                Quick wins (Phase 1), core digitization (Phase 2), and strategic growth (Phase 3).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EDE2D8] bg-white flex items-center justify-between">
          <span className="text-xs text-[#6B5D52]">
            Recorded live during system evaluation session.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            {currentLang === "hi" ? "बंद करें" : "Close Guide"}
          </Button>
        </div>
      </div>
    </div>
  );
};
