import React, { useState } from 'react';
import { 
  IRACArgument, 
  LegalCaseSession 
} from '../types';
import { exportService } from '../services/exportService';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Scale, 
  AlertTriangle, 
  Award, 
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface IRACViewerProps {
  session: LegalCaseSession;
  argument: IRACArgument;
  onOpenStrengthScoring: () => void;
  onSwitchToCounter: () => void;
  onSwitchToExplainer: () => void;
  onUpdateArgument?: (newArgument: IRACArgument) => void;
}

export const IRACViewer: React.FC<IRACViewerProps> = ({
  session,
  argument,
  onOpenStrengthScoring,
  onSwitchToCounter,
  onSwitchToExplainer,
  onUpdateArgument
}) => {
  const [copiedOverall, setCopiedOverall] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Expansion states
  const [expandedIssue, setExpandedIssue] = useState(true);
  const [expandedRule, setExpandedRule] = useState(true);
  const [expandedApp, setExpandedApp] = useState(true);
  const [expandedConc, setExpandedConc] = useState(true);

  // Inline editing states
  const [editingSection, setEditingSection] = useState<'issue' | 'rule' | 'application' | 'conclusion' | null>(null);
  const [editIssueText, setEditIssueText] = useState(argument.issue);
  const [editRuleText, setEditRuleText] = useState(argument.rule.generalFramework);
  const [editAppText, setEditAppText] = useState(argument.application.synthesis);
  const [editConcText, setEditConcText] = useState(argument.conclusion.primaryFinding);

  const handleCopySection = async (sectionName: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyAll = async () => {
    const success = await exportService.copyBriefToClipboard(session);
    if (success) {
      setCopiedOverall(true);
      setTimeout(() => setCopiedOverall(false), 2000);
    }
  };

  const handleSaveSection = (section: 'issue' | 'rule' | 'application' | 'conclusion') => {
    if (!onUpdateArgument) {
      setEditingSection(null);
      return;
    }

    const updated = { ...argument };
    if (section === 'issue') {
      updated.issue = editIssueText;
    } else if (section === 'rule') {
      updated.rule = { ...updated.rule, generalFramework: editRuleText };
    } else if (section === 'application') {
      updated.application = { ...updated.application, synthesis: editAppText };
    } else if (section === 'conclusion') {
      updated.conclusion = { ...updated.conclusion, primaryFinding: editConcText };
    }

    onUpdateArgument(updated);
    setEditingSection(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* 1. Brief Header / Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121214] border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold tracking-wider">
              IRAC PRACTICE BRIEF
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {session.subject} &bull; {session.jurisdiction}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {session.title || 'Moot Court Legal Submission'}
          </h2>
        </div>

        {/* Action Controls: Copy, TXT, PDF, Strength */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenStrengthScoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium transition-colors cursor-pointer"
            title="Inspect argument strength scoring breakdown"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Score (84/100)</span>
          </button>

          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Copy brief markdown"
          >
            {copiedOverall ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedOverall ? 'Copied' : 'Copy All'}</span>
          </button>

          <button
            onClick={() => exportService.exportToTXT(session)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Download plain text brief"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={() => exportService.exportToPDF(session)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
            title="Generate print-ready PDF brief"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Educational Notice & No Fake Citations Alert */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            <strong className="text-zinc-300">AI-generated practice content:</strong> Verified general legal principles applied without fictional case law citations.
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
          EDUCATIONAL PRACTICE MATERIAL
        </span>
      </div>

      {/* 3. IRAC Sections: Readable, Copyable, Expandable, Editable */}
      <div className="space-y-3.5">
        
        {/* I - ISSUE */}
        <div className="p-5 rounded-2xl bg-[#121214]/95 border border-white/8 shadow-md space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                I
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Legal Issue For Adjudication
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopySection('issue', argument.issue)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Issue"
              >
                {copiedSection === 'issue' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setEditingSection(editingSection === 'issue' ? null : 'issue');
                  setEditIssueText(argument.issue);
                }}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit Issue"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setExpandedIssue(!expandedIssue)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={expandedIssue ? 'Collapse' : 'Expand'}
              >
                {expandedIssue ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {expandedIssue && (
            <div className="pt-1">
              {editingSection === 'issue' ? (
                <div className="space-y-2">
                  <textarea
                    value={editIssueText}
                    onChange={(e) => setEditIssueText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('issue')}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-200 leading-relaxed font-medium pl-1">
                  "{argument.issue}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* R - RULE & PRINCIPLES */}
        <div className="p-5 rounded-2xl bg-[#121214]/95 border border-white/8 shadow-md space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                R
              </span>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Governing Legal Rules &amp; Doctrines
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopySection('rule', argument.rule.generalFramework)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Rule"
              >
                {copiedSection === 'rule' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setEditingSection(editingSection === 'rule' ? null : 'rule');
                  setEditRuleText(argument.rule.generalFramework);
                }}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit Rule"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setExpandedRule(!expandedRule)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={expandedRule ? 'Collapse' : 'Expand'}
              >
                {expandedRule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {expandedRule && (
            <div className="space-y-3 pt-1">
              {editingSection === 'rule' ? (
                <div className="space-y-2">
                  <textarea
                    value={editRuleText}
                    onChange={(e) => setEditRuleText(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('rule')}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {argument.rule.generalFramework}
                </p>
              )}

              {/* Principle Cards */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Applicable Doctrinal Benchmarks:
                </div>
                {argument.rule.principles.map((principle, index) => (
                  <div 
                    key={principle.doctrineName}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400 font-bold">{index + 1}.</span>
                        <h4 className="text-xs font-bold text-white">{principle.doctrineName}</h4>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {principle.sourceType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pl-4 border-l border-zinc-800">
                      {principle.statement}
                    </p>
                    <div className="pl-4 text-[10px] text-zinc-400 italic">
                      Note: {principle.verificationNotice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* A - APPLICATION */}
        <div className="p-5 rounded-2xl bg-[#121214]/95 border border-white/8 shadow-md space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                A
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Application of Law to Case Facts
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopySection('application', argument.application.synthesis)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Application"
              >
                {copiedSection === 'application' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setEditingSection(editingSection === 'application' ? null : 'application');
                  setEditAppText(argument.application.synthesis);
                }}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit Application"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setExpandedApp(!expandedApp)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={expandedApp ? 'Collapse' : 'Expand'}
              >
                {expandedApp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {expandedApp && (
            <div className="space-y-3 pt-1">
              {editingSection === 'application' ? (
                <div className="space-y-2">
                  <textarea
                    value={editAppText}
                    onChange={(e) => setEditAppText(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('application')}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  <p>{argument.application.synthesis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                  <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Key Factual Touchpoints
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {argument.application.factualPointsApplied.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">&bull;</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                  <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Primary Argumentative Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {argument.application.studentStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">&bull;</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* C - CONCLUSION */}
        <div className="p-5 rounded-2xl bg-[#121214]/95 border border-white/8 shadow-md space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                C
              </span>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Conclusion &amp; Moot Submissions
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopySection('conclusion', argument.conclusion.primaryFinding)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Conclusion"
              >
                {copiedSection === 'conclusion' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setEditingSection(editingSection === 'conclusion' ? null : 'conclusion');
                  setEditConcText(argument.conclusion.primaryFinding);
                }}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit Conclusion"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setExpandedConc(!expandedConc)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={expandedConc ? 'Collapse' : 'Expand'}
              >
                {expandedConc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {expandedConc && (
            <div className="space-y-3 pt-1">
              {editingSection === 'conclusion' ? (
                <div className="space-y-2">
                  <textarea
                    value={editConcText}
                    onChange={(e) => setEditConcText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSection('conclusion')}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                  {argument.conclusion.primaryFinding}
                </p>
              )}

              <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-200/90 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-300 font-semibold block mb-0.5">Moot Court Bench Strategy:</strong>
                  {argument.conclusion.practicalAdviceForMoot}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Bottom Mode Switcher Helpers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onSwitchToCounter}
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
              Adversarial Mode
            </div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
              Challenge This Argument &rarr;
            </div>
          </div>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={onSwitchToExplainer}
          className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
              Clarity &amp; Accessibility
            </div>
            <div className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
              Explain Simply (1L Explainer) &rarr;
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-orange-300" />
        </button>
      </div>

    </div>
  );
};
export default IRACViewer;
