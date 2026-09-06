import React, { useState } from 'react';
import { PlainLanguageData, LegalCaseSession } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  Columns, 
  HelpCircle, 
  ArrowRightLeft, 
  Lightbulb,
  BookMarked
} from 'lucide-react';

interface PlainLanguageViewerProps {
  session: LegalCaseSession;
  data: PlainLanguageData;
}

export const PlainLanguageViewer: React.FC<PlainLanguageViewerProps> = ({
  session,
  data
}) => {
  const [splitMode, setSplitMode] = useState<'side-by-side' | 'original' | 'simplified'>('side-by-side');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* 1. Header & Target Audience Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold tracking-wider uppercase">
                1L Learning Sandbox
              </span>
              <span className="text-xs text-zinc-400">Plain-Language Translation</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Demystifying Complex Doctrinal Reasoning
            </h2>
          </div>
        </div>

        {/* Split View Toggle Controls */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0 text-xs">
          <button
            onClick={() => setSplitMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              splitMode === 'side-by-side' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>

          <button
            onClick={() => setSplitMode('original')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              splitMode === 'original' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Original
          </button>

          <button
            onClick={() => setSplitMode('simplified')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              splitMode === 'simplified' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Simplified
          </button>
        </div>
      </div>

      {/* 2. Interactive Before / After Split Comparison (Section 60) */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
            <span>Before &amp; After: Dense Jurisprudence vs Plain Meaning</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Interactive Comparison</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Dense Legal Prose */}
          {(splitMode === 'side-by-side' || splitMode === 'original') && (
            <div className={`p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 ${
              splitMode === 'original' ? 'md:col-span-2' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                  Original Legal Brief Text (Dense)
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">Formal</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed italic">
                "{data.originalDenseComparison.originalProse}"
              </p>
            </div>
          )}

          {/* Simplified Prose */}
          {(splitMode === 'side-by-side' || splitMode === 'simplified') && (
            <div className={`p-4 rounded-xl bg-orange-950/10 border border-orange-500/20 space-y-2 ${
              splitMode === 'simplified' ? 'md:col-span-2' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-orange-400 font-semibold">
                  Plain-Language Translation
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">1L Plain</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                "{data.originalDenseComparison.simplifiedProse}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. In Simple Terms Card */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>In Simple Terms: The Story of the Case</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed pl-1">
          {data.inSimpleTerms}
        </p>
      </div>

      {/* 4. Key Legal Terms Glossary (Latin & Technical Terms) */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5 text-orange-400" />
            <span>Key Terms &amp; Latin Maxims Explained</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Glossary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {data.keyTerms.map((termItem) => (
            <div 
              key={termItem.term}
              className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white font-mono">{termItem.term}</h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Meaning</span>
              </div>
              <p className="text-xs text-orange-300/90 font-medium">
                &rarr; {termItem.plainMeaning}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1 border-t border-zinc-900">
                <strong className="text-zinc-300">Application:</strong> {termItem.contextInCase}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Why It Matters Card */}
      <div className="p-5 rounded-2xl bg-[#121214] border border-white/8 space-y-2">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Why It Matters in Real-World Legal Practice
        </h4>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {data.whyItMatters}
        </p>
      </div>

    </div>
  );
};
