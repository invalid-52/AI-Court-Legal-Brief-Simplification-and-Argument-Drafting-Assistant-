import React from 'react';
import { CounterArgumentData, LegalCaseSession } from '../types';
import { 
  ShieldAlert, 
  Flame, 
  Target, 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CounterArgumentViewerProps {
  session: LegalCaseSession;
  counterData: CounterArgumentData;
  onStartVirtualDebate: () => void;
}

export const CounterArgumentViewer: React.FC<CounterArgumentViewerProps> = ({
  session,
  counterData,
  onStartVirtualDebate
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* 1. Opposition Header Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold tracking-wider uppercase">
                Opposition Stance
              </span>
              <span className="text-xs text-zinc-400">Adversarial Bench Analysis</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              The Opposition’s Counter-Theories &amp; Pressure Points
            </h2>
          </div>
        </div>

        <button
          onClick={onStartVirtualDebate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Practice Live Rebuttal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Core Opposing Theory */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" />
          <span>Core Adversarial Theory</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
          "{counterData.oppositionCoreTheory}"
        </p>
      </div>

      {/* 3. Vulnerabilities & Alternative Interpretations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Vulnerabilities in Rule Application */}
        <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider border-b border-white/5 pb-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Vulnerabilities In Your Rule</span>
          </div>
          <p className="text-xs text-zinc-400">
            Opposing counsel will attack your doctrinal interpretation at these specific junctures:
          </p>
          <ul className="space-y-2.5">
            {counterData.ruleVulnerabilities.map((vuln, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                <span className="text-red-400 font-mono font-bold mt-0.5">[{idx + 1}]</span>
                <span>{vuln}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternative Interpretations of Facts */}
        <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider border-b border-white/5 pb-2">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Alternative Factual Narratives</span>
          </div>
          <p className="text-xs text-zinc-400">
            How the opposition will frame the timeline and conduct differently before the bench:
          </p>
          <ul className="space-y-2.5">
            {counterData.alternativeFactualInterpretations.map((alt, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                <span className="text-orange-400 font-mono font-bold mt-0.5">[{idx + 1}]</span>
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 4. Opposing Conclusion */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-2">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Strongest Opposing Conclusion
        </h4>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {counterData.strongestOpposingConclusions}
        </p>
      </div>

      {/* 5. Recommended Rebuttal Tactics */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-[#121214] to-zinc-900 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended Moot Court Rebuttal Strategy</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">ADVOCACY TACTICS</span>
        </div>

        <div className="space-y-2 pt-1">
          {counterData.suggestedRebuttalTactics.map((tactic, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-200 leading-relaxed font-medium">
                {tactic}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 text-center sm:text-left">
            Ready to test these rebuttals in real-time oral debate simulation?
          </p>
          <button
            onClick={onStartVirtualDebate}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <span>Launch Virtual Debate Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
