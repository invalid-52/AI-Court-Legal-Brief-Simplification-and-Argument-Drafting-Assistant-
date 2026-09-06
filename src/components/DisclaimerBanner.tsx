import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 py-1.5 px-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 backdrop-blur-md ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
          Educational Practice Tool
        </span>
        <span className="text-zinc-600">|</span>
        <span className="truncate">Not legal advice &bull; Hypothetical practice only</span>
      </div>
    );
  }

  return (
    <div className={`w-full py-2.5 px-4 bg-zinc-950/90 border-b border-zinc-900/80 text-xs text-zinc-400 backdrop-blur-md z-30 transition-all ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-zinc-200 font-medium mr-1">Educational Practice Tool:</strong>
            Lexora provides AI-generated material for legal education, moot court practice, and argument training only. It is not legal advice, does not represent a lawyer-client relationship, and must not be relied upon for real legal matters or unverified citations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            General Principles Only
          </span>
        </div>
      </div>
    </div>
  );
};

export const ConfidentialityWarning: React.FC = () => {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90">
      <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold text-amber-300">Hypothetical Sandbox Notice:</span>{' '}
        This workspace is intended for hypothetical moot court problems and academic exercises. Avoid entering confidential client information or details from active, pending legal disputes.
      </div>
    </div>
  );
};

export const VerificationNoticeBadge: React.FC<{ notice?: string }> = ({ 
  notice = 'General legal principles only — independent citation verification required' 
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      <span>{notice}</span>
    </div>
  );
};
