import React from "react";
import { Sparkles, BookOpen } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-slate-950/60 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>DigiMitra — Requirement-Based Digitalization of MSMEs in India</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <a
            href="http://localhost:8000/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Swagger OpenAPI
          </a>
          <span>•</span>
          <span>FastAPI + React 18 + MySQL 8</span>
        </div>
      </div>
    </footer>
  );
};
