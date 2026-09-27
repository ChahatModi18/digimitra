import React, { createContext, useContext, useEffect, useState } from "react";

export type MsmeThemeId = "msme-saffron" | "msme-navy" | "msme-teal" | "msme-amber";

export interface MsmeTheme {
  id: MsmeThemeId;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  primaryHex: string;
  primaryHoverHex: string;
  primaryLightHex: string;
  secondaryHex: string;
  secondaryLightHex: string;
  bgSurfaceAltHex: string;
  heroGradient: string;
}

export const MSME_THEMES: Record<MsmeThemeId, MsmeTheme> = {
  "msme-saffron": {
    id: "msme-saffron",
    nameEn: "MSME Saffron (Default)",
    nameHi: "केसरिया (Saffron)",
    descriptionEn: "Warm Indian entrepreneurial vibrancy & retail focus",
    descriptionHi: "भारतीय व्यापारिक ऊर्जा एवं जीवंतता",
    primaryHex: "#F0592A",
    primaryHoverHex: "#D94A1F",
    primaryLightHex: "#FFE8DE",
    secondaryHex: "#1B7A6E",
    secondaryLightHex: "#DCF2EE",
    bgSurfaceAltHex: "#FFF4ED",
    heroGradient: "from-[#F0592A] via-[#FF6B35] to-[#D94A1F]",
  },
  "msme-navy": {
    id: "msme-navy",
    nameEn: "MSME India Blue (Udyam)",
    nameHi: "उद्यम नीला (Govt Blue)",
    descriptionEn: "National Udyam portal & institutional banking trust",
    descriptionHi: "आधिकारिक उद्यम पोर्टल एवं बैंकिंग विश्वसनीयता",
    primaryHex: "#0E4B94",
    primaryHoverHex: "#0A3870",
    primaryLightHex: "#E1EEFB",
    secondaryHex: "#0F766E",
    secondaryLightHex: "#D1FAE5",
    bgSurfaceAltHex: "#F0F6FD",
    heroGradient: "from-[#0E4B94] via-[#1E60B5] to-[#0A3870]",
  },
  "msme-teal": {
    id: "msme-teal",
    nameEn: "Ministry Forest Teal",
    nameHi: "हरित विकास (Green Growth)",
    descriptionEn: "Vocal for Local, sustainability & modern manufacturing",
    descriptionHi: "स्थानीय विनिर्माण एवं पर्यावरण अनुकूल एमएसएमई",
    primaryHex: "#0D7A68",
    primaryHoverHex: "#095F51",
    primaryLightHex: "#D3F2EC",
    secondaryHex: "#C25E00",
    secondaryLightHex: "#FEF3C7",
    bgSurfaceAltHex: "#EDF9F6",
    heroGradient: "from-[#0D7A68] via-[#129A84] to-[#095F51]",
  },
  "msme-amber": {
    id: "msme-amber",
    nameEn: "Bharat Saffron-Gold",
    nameHi: "स्वर्णिम भारत (Heritage Gold)",
    descriptionEn: "Khadi, artisanal crafts & traditional enterprise heritage",
    descriptionHi: "खादी, हस्तशिल्प एवं पारंपरिक भारतीय उद्यम",
    primaryHex: "#C25E00",
    primaryHoverHex: "#A14D00",
    primaryLightHex: "#FEF3C7",
    secondaryHex: "#0E4B94",
    secondaryLightHex: "#E1EEFB",
    bgSurfaceAltHex: "#FFFBEB",
    heroGradient: "from-[#C25E00] via-[#DE7205] to-[#A14D00]",
  },
};

interface ThemeContextType {
  theme: MsmeTheme;
  themeId: MsmeThemeId;
  setThemeId: (id: MsmeThemeId) => void;
  availableThemes: MsmeTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "digimitra_msme_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<MsmeThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as MsmeThemeId;
    return saved && MSME_THEMES[saved] ? saved : "msme-saffron";
  });

  const setThemeId = (newId: MsmeThemeId) => {
    if (MSME_THEMES[newId]) {
      setThemeIdState(newId);
      localStorage.setItem(THEME_STORAGE_KEY, newId);
    }
  };

  const activeTheme = MSME_THEMES[themeId] || MSME_THEMES["msme-saffron"];

  // Apply CSS custom properties dynamically to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", activeTheme.primaryHex);
    root.style.setProperty("--color-primary-hover", activeTheme.primaryHoverHex);
    root.style.setProperty("--color-primary-light", activeTheme.primaryLightHex);
    root.style.setProperty("--color-secondary", activeTheme.secondaryHex);
    root.style.setProperty("--color-secondary-light", activeTheme.secondaryLightHex);
    root.style.setProperty("--color-bg-surface-alt", activeTheme.bgSurfaceAltHex);
    root.setAttribute("data-msme-theme", activeTheme.id);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeId,
        setThemeId,
        availableThemes: Object.values(MSME_THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
