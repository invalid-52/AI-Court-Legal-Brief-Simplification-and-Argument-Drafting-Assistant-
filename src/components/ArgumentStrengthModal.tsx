import React from 'react';
import { StrengthScore } from '../types';
import { Award, CheckCircle, AlertTriangle, X, TrendingUp } from 'lucide-react';

interface ArgumentStrengthModalProps {
  scoreData: StrengthScore;
  onClose: () => void;
}

export const ArgumentStrengthModal: React.FC<ArgumentStrengthModalProps> = ({
  scoreData,
  onClose
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Argument Strength Assessment</h3>
              <p className="text-xs text-zinc-400">Diagnostic feedback on structure, reasoning, and advocacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Score Gauge / Hero Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-zinc-950 border border-white/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider block mb-1">
              Overall Practice Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {scoreData.overallScore}
              </span>
              <span className="text-base font-medium text-zinc-400">/ 100</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Solid Moot Court Readiness</span>
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
            {scoreData.overallScore}%
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Diagnostic Category Breakdown
          </h4>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 font-medium">Structure (IRAC Adherence)</span>
                <span className="font-mono text-zinc-200">{scoreData.breakdown.structureScore} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                  style={{ width: `${scoreData.breakdown.structureScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 font-medium">Legal Reasoning &amp; Doctrinal Breadth</span>
                <span className="font-mono text-zinc-200">{scoreData.breakdown.legalReasoningScore} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                  style={{ width: `${scoreData.breakdown.legalReasoningScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 font-medium">Factual Synthesis &amp; Timeline Application</span>
                <span className="font-mono text-zinc-200">{scoreData.breakdown.factApplicationScore} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${scoreData.breakdown.factApplicationScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 font-medium">Counter-Argument Readiness</span>
                <span className="font-mono text-zinc-200">{scoreData.breakdown.counterArgumentReadinessScore} / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                  style={{ width: `${scoreData.breakdown.counterArgumentReadinessScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback Suggestions */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Recommendations for Oral Moot Preparation
          </h4>
          <div className="space-y-2">
            {scoreData.feedbackSuggestions.map((tip, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Educational Disclaimer */}
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-400">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Educational Feedback Only:</strong> {scoreData.disclaimer}
          </span>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Back to Brief
          </button>
        </div>

      </div>
    </div>
  );
};
