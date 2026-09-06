import React, { useState } from 'react';
import { 
  ChatMessage, 
  LegalCaseSession 
} from '../types';
import { exportService } from '../services/exportService';
import { 
  Copy, 
  Check, 
  Download, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Columns, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  session: LegalCaseSession;
  onOpenStrengthModal: () => void;
  onSwitchToCounter: () => void;
  onSwitchToExplainer: () => void;
  onEnterDebate: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  session,
  onOpenStrengthModal,
  onSwitchToCounter,
  onSwitchToExplainer,
  onEnterDebate
}) => {
  const [copied, setCopied] = useState(false);
  const [explainerSplitMode, setExplainerSplitMode] = useState<'side-by-side' | 'original' | 'simplified'>('side-by-side');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(session);
  };

  // 1. User Message: Compact Dark Bubble Aligned Right
  if (message.role === 'user') {
    return (
      <div className="w-full flex justify-end my-3 select-none">
        <div className="max-w-2xl bg-[#171719] border border-white/8 rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-zinc-100 shadow-sm space-y-1.5">
          {message.attachmentName && (
            <div className="flex items-center gap-1.5 text-[11px] text-orange-400 font-medium">
              <FileText className="w-3 h-3" />
              <span>{message.attachmentName}</span>
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <div className="text-[10px] text-zinc-400 text-right font-mono">{message.timestamp}</div>
        </div>
      </div>
    );
  }

  // 2. AI Response: Clean Left-Aligned Structured Reasoning Stream
  return (
    <div className="w-full my-6 group">
      <div className="max-w-3xl space-y-4">
        
        {/* Assistant Header / Mode Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-orange-500" />
              </div>
            </div>
            <span className="font-bold text-xs text-white tracking-tight">Lexora</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/6 text-orange-400 font-semibold uppercase">
              {message.mode}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
            <span>{session.jurisdiction.split(' ')[0]}</span>
            <span>&bull;</span>
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* AI Educational Notice */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 pl-1">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span>General legal doctrines only &bull; Zero fabricated citations &bull; Educational practice</span>
        </div>

        {/* A. ARGUMENT MODE OUTPUT (IRAC) */}
        {message.iracData && (
          <div className="space-y-4 pt-1 text-xs sm:text-sm text-zinc-200">
            
            {/* ISSUE */}
            <div className="space-y-1 pl-3 border-l-2 border-orange-500/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold block">
                ISSUE
              </span>
              <p className="leading-relaxed font-medium">
                "{message.iracData.issue}"
              </p>
            </div>

            {/* RULE */}
            <div className="space-y-2 pl-3 border-l-2 border-white/15">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                RULE (GOVERNING DOCTRINES)
              </span>
              <p className="leading-relaxed text-zinc-300">
                {message.iracData.rule.generalFramework}
              </p>

              {/* General Principles */}
              <div className="space-y-2 pt-1">
                {message.iracData.rule.principles.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#0D0D0F] border border-white/6 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-300 font-semibold">
                      <span>{idx + 1}. {p.doctrineName}</span>
                      <span className="text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">
                        {p.sourceType}
                      </span>
                    </div>
                    <p className="text-zinc-400 leading-snug">{p.statement}</p>
                    <div className="text-[10px] text-zinc-400 italic">Notice: {p.verificationNotice}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLICATION */}
            <div className="space-y-2 pl-3 border-l-2 border-white/15">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                APPLICATION TO FACTS
              </span>
              <p className="leading-relaxed text-zinc-300">
                {message.iracData.application.synthesis}
              </p>
              <ul className="space-y-1 pt-1 text-xs text-zinc-400">
                {message.iracData.application.factualPointsApplied.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">&bull;</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONCLUSION */}
            <div className="space-y-2 pl-3 border-l-2 border-emerald-500/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                CONCLUSION &amp; MOOT STRATEGY
              </span>
              <p className="leading-relaxed font-medium text-zinc-100">
                {message.iracData.conclusion.primaryFinding}
              </p>
              <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-200">
                <strong className="text-orange-300 font-semibold">Oral Advocacy Advice:</strong>{' '}
                {message.iracData.conclusion.practicalAdviceForMoot}
              </div>
            </div>

          </div>
        )}

        {/* B. COUNTER-ARGUMENT OUTPUT */}
        {message.counterData && (
          <div className="space-y-3 pt-1 text-xs sm:text-sm text-zinc-200">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-medium">
              "Let me attack that position from opposing counsel’s strongest angle."
            </div>

            <div className="space-y-1 pl-3 border-l-2 border-amber-500/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                STRONGEST OPPOSING OBJECTION
              </span>
              <p className="leading-relaxed text-zinc-200">
                "{message.counterData.oppositionCoreTheory}"
              </p>
            </div>

            <div className="space-y-2 pl-3 border-l-2 border-red-500/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
                VULNERABILITIES IN YOUR RULE
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {message.counterData.ruleVulnerabilities.map((vuln, i) => (
                  <li key={i} className="p-2 rounded-lg bg-[#0D0D0F] border border-white/6 flex items-start gap-2">
                    <span className="text-red-400 font-bold font-mono">[{i + 1}]</span>
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#111113] border border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              <span className="text-xs text-zinc-300">
                Want to defend your position against live bench questions?
              </span>
              <button
                onClick={onEnterDebate}
                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Enter Virtual Debate</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* C. PLAIN-LANGUAGE EXPLAINER OUTPUT */}
        {message.plainData && (
          <div className="space-y-3 pt-1 text-xs sm:text-sm text-zinc-200">
            {/* Split Toggle */}
            <div className="flex items-center justify-between border-b border-white/6 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                1L PLAIN-LANGUAGE TRANSLATION
              </span>
              <div className="flex items-center bg-[#09090B] p-0.5 rounded-lg border border-white/6 text-xs">
                <button
                  onClick={() => setExplainerSplitMode('side-by-side')}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    explainerSplitMode === 'side-by-side' ? 'bg-[#171719] text-white' : 'text-zinc-400'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setExplainerSplitMode('original')}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    explainerSplitMode === 'original' ? 'bg-[#171719] text-white' : 'text-zinc-400'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setExplainerSplitMode('simplified')}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    explainerSplitMode === 'simplified' ? 'bg-[#171719] text-white' : 'text-zinc-400'
                  }`}
                >
                  Simplified
                </button>
              </div>
            </div>

            {/* Before / After Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(explainerSplitMode === 'side-by-side' || explainerSplitMode === 'original') && (
                <div className="p-3 rounded-xl bg-[#0D0D0F] border border-white/6 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                    Original Dense Reasoning
                  </span>
                  <p className="text-xs text-zinc-300 font-serif italic leading-relaxed">
                    "{message.plainData.originalDenseComparison.originalProse}"
                  </p>
                </div>
              )}

              {(explainerSplitMode === 'side-by-side' || explainerSplitMode === 'simplified') && (
                <div className="p-3 rounded-xl bg-orange-950/15 border border-orange-500/20 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-orange-400 font-semibold">
                    Simplified Plain Meaning
                  </span>
                  <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                    "{message.plainData.originalDenseComparison.simplifiedProse}"
                  </p>
                </div>
              )}
            </div>

            {/* Story / In Simple Terms */}
            <div className="space-y-1 pl-3 border-l-2 border-orange-500/40">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                IN SIMPLE TERMS
              </span>
              <p className="leading-relaxed text-zinc-200">
                {message.plainData.inSimpleTerms}
              </p>
            </div>

            {/* Key Terms */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                KEY LATIN &amp; LEGAL TERMS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.plainData.keyTerms.map((term, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#0D0D0F] border border-white/6 text-xs space-y-1">
                    <div className="font-mono font-bold text-white text-xs">{term.term}</div>
                    <div className="text-orange-300/90 font-medium text-[11px]">&rarr; {term.plainMeaning}</div>
                    <div className="text-zinc-400 text-[10px]">{term.contextInCase}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Content if plain message */}
        {!message.iracData && !message.counterData && !message.plainData && (
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Secondary Actions Toolbar (Visible on Hover / Focus) */}
        <div className="pt-2 border-t border-white/6 flex items-center gap-2 flex-wrap text-xs text-zinc-400 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy brief text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Download PDF brief"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">PDF</span>
          </button>

          <button
            onClick={onOpenStrengthModal}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer text-orange-400/90"
            title="Inspect argument strength scoring"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px]">Score (84)</span>
          </button>

          <button
            onClick={onSwitchToCounter}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Attack this position from opposition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Counter-Argument</span>
          </button>

          <button
            onClick={onSwitchToExplainer}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-orange-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Explain this argument in simple 1L terms"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-300" />
            <span className="text-[11px]">Explain</span>
          </button>
        </div>

      </div>
    </div>
  );
};
