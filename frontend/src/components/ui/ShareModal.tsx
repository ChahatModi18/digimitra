import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  ExternalLink,
} from "lucide-react";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  shareUrl?: string;
  currentLang?: "en" | "hi";
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = "DigiMitra MSME Digital Consultant",
  description = "Discover your business digital readiness level and get a customized roadmap with DigiMitra!",
  shareUrl = window?.location?.href || "http://localhost:5173",
  currentLang = "en",
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title}\n\n${description}\n\n${shareUrl}`);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      color: "bg-[#0A66C2] hover:bg-[#084e96] text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Twitter / X",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black hover:bg-stone-800 text-white",
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-amber-600 hover:bg-amber-700 text-white",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="share-modal-title"
                className="text-base font-bold font-heading text-stone-900"
              >
                {currentLang === "hi" ? "डिजीमित्र साझा करें" : "Share DigiMitra"}
              </h3>
              <p className="text-xs text-stone-500">
                {currentLang === "hi"
                  ? "अन्य व्यापारियों व उद्यमियों के साथ साझा करें"
                  : "Help fellow Indian local businesses digitalize"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Channels */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            {currentLang === "hi" ? "सीधे साझा करें" : "Share Directly"}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {shareChannels.map((ch) => (
              <a
                key={ch.name}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] ${ch.color}`}
              >
                {ch.icon}
                <span>{ch.name}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ))}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            {currentLang === "hi" ? "लिंक कॉपी करें" : "Copy Direct Link"}
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-50 border border-stone-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2.5 text-xs text-stone-700 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-900 hover:bg-stone-800 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{currentLang === "hi" ? "कॉपी हो गया!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{currentLang === "hi" ? "कॉपी" : "Copy"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Research / MSME note */}
        <p className="text-[11px] text-stone-400 text-center leading-normal">
          {currentLang === "hi"
            ? "डिजीमित्र पूरी तरह निःशुल्क और गैर-व्यावसायिक शोध ढांचा है।"
            : "DigiMitra is a 100% free, deterministic open diagnostic tool for Indian MSMEs."}
        </p>
      </div>
    </div>
  );
};
