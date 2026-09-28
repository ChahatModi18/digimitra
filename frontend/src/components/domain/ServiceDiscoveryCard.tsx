import React from "react";
import {
  ExternalLink,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  Globe,
  Megaphone,
  GraduationCap,
  Server,
} from "lucide-react";
import { ServiceProviderItem } from "../../api/discovery";
import { Button } from "../ui/Button";

interface ServiceDiscoveryCardProps {
  item: ServiceProviderItem;
  currentLang?: "en" | "hi";
  onSelect?: (item: ServiceProviderItem) => void;
}

export const ServiceDiscoveryCard: React.FC<ServiceDiscoveryCardProps> = ({
  item,
  currentLang = "en",
  onSelect,
}) => {
  const isHi = currentLang === "hi";
  const description =
    isHi && item.short_description_hi ? item.short_description_hi : item.short_description_en;
  const actionLabel = isHi && item.action_label_hi ? item.action_label_hi : item.action_label_en || "View Details";

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case "payments":
        return <CreditCard className="w-4 h-4" />;
      case "accounting":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "website":
        return <Globe className="w-4 h-4" />;
      case "marketing":
        return <Megaphone className="w-4 h-4" />;
      case "training":
        return <GraduationCap className="w-4 h-4" />;
      case "msme_support":
        return <Building2 className="w-4 h-4" />;
      case "infrastructure":
        return <Server className="w-4 h-4" />;
      case "security":
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 transition-all duration-300 hover:border-orange-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="space-y-3">
        {/* Badges & Category Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80">
              {getCategoryIcon(item.category_id)}
              <span>{item.category_id.replace("_", " ")}</span>
            </span>

            {item.is_official_resource && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {isHi ? "आधिकारिक केंद्र" : "Official Resource"}
              </span>
            )}

            {item.is_mock_data && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                TEST MOCK
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
          {item.name}
        </h4>

        {/* Location snippet */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>
            {item.locality}, {item.district ? `${item.district}, ` : ""}
            {item.state} {item.pincode ? `- ${item.pincode}` : ""}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 flex-wrap">
        {item.contact_phone ? (
          <div className="flex items-center gap-1 text-xs text-stone-600 font-semibold">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <span>{item.contact_phone}</span>
          </div>
        ) : (
          <span className="text-[11px] text-stone-400 font-medium">
            {isHi ? "सत्यापित लिस्टिंग" : "Verified Provider"}
          </span>
        )}

        {item.action_url ? (
          <a
            href={item.action_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition"
          >
            <span>{actionLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : onSelect ? (
          <Button variant="outline" size="sm" onClick={() => onSelect(item)}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
