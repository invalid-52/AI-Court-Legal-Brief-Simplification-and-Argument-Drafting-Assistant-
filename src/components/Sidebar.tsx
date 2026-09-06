import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  PanelLeftClose, 
  PanelLeft, 
  Trash2, 
  FileText, 
  LogOut, 
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { LegalCaseSession, PracticeMode } from '../types';

interface SidebarProps {
  sessions: LegalCaseSession[];
  activeSessionId?: string;
  onSelectSession: (session: LegalCaseSession) => void;
  onNewPracticeCase: () => void;
  onSelectSampleCase: () => void;
  activeMode: PracticeMode;
  onSelectMode: (mode: PracticeMode) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewPracticeCase,
  onSelectSampleCase,
  activeMode,
  onSelectMode,
  onDeleteSession,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile
}) => {
  const navigate = useNavigate();

  // Categorize sessions into Today, Yesterday, Older
  const now = Date.now();
  const todaySessions: LegalCaseSession[] = [];
  const yesterdaySessions: LegalCaseSession[] = [];
  const olderSessions: LegalCaseSession[] = [];

  sessions.forEach((s) => {
    const sessionTime = new Date(s.updatedAt).getTime();
    const diffHours = (now - sessionTime) / (1000 * 60 * 60);

    if (diffHours < 24) {
      todaySessions.push(s);
    } else if (diffHours < 48) {
      yesterdaySessions.push(s);
    } else {
      olderSessions.push(s);
    }
  });

  const handleSessionClick = (session: LegalCaseSession) => {
    onSelectSession(session);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside 
      className={`h-screen bg-[#080809] border-r border-white/6 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 1. Header with Brand & Collapse Toggle */}
      <div className="p-3.5 border-b border-white/6 flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-orange-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs tracking-tight">Lexora</span>
              <span className="text-[9px] text-zinc-400 font-mono tracking-wider">LEGAL AI</span>
            </div>
          </Link>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Top Primary Action: + New Practice Case */}
      <div className="p-3 space-y-1.5">
        <button
          onClick={onNewPracticeCase}
          className={`w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="New Practice Case"
        >
          <Plus className="w-4 h-4 text-black shrink-0" />
          {!isCollapsed && <span>New Practice Case</span>}
        </button>

        {!isCollapsed && (
          <button
            onClick={onSelectSampleCase}
            className="w-full py-1.5 px-3 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkle className="w-3 h-3 text-orange-400" />
            <span>Try Sample Case (Contract)</span>
          </button>
        )}
      </div>

      {/* 3. Main Nav & Recent Sessions (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar text-xs">
        
        {/* PRACTICE MODES */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              Practice Modes
            </div>
          )}

          <button
            onClick={() => onSelectMode('argument')}
            className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeMode === 'argument'
                ? 'bg-[#171719] text-white border border-white/8 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
            }`}
            title="IRAC Argument Builder"
          >
            <Scale className="w-4 h-4 text-orange-400 shrink-0" />
            {!isCollapsed && <span>IRAC Argument</span>}
          </button>

          <button
            onClick={() => onSelectMode('counter')}
            className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeMode === 'counter'
                ? 'bg-[#171719] text-white border border-white/8 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
            }`}
            title="Adversarial Counter-Argument"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            {!isCollapsed && <span>Counter-Argument</span>}
          </button>

          <button
            onClick={() => onSelectMode('explain')}
            className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeMode === 'explain'
                ? 'bg-[#171719] text-white border border-white/8 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
            }`}
            title="1L Plain-Language Explainer"
          >
            <Sparkles className="w-4 h-4 text-orange-300 shrink-0" />
            {!isCollapsed && <span>Plain-Language</span>}
          </button>

          <button
            onClick={() => onSelectMode('debate')}
            className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
              activeMode === 'debate'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
            }`}
            title="Virtual Moot Court Debate"
          >
            <MessageSquare className="w-4 h-4 text-orange-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Virtual Debate</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
                  ORB
                </span>
              </div>
            )}
          </button>
        </div>

        {/* RECENT CASE SESSIONS */}
        {!isCollapsed && (
          <div className="space-y-3 pt-2 border-t border-white/6">
            <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              <span>Recent Briefs</span>
              <Clock className="w-3 h-3 text-zinc-400" />
            </div>

            {sessions.length === 0 ? (
              <div className="px-2 text-[11px] text-zinc-400 italic">No saved briefs yet</div>
            ) : (
              <div className="space-y-1">
                {sessions.slice(0, 8).map((s) => {
                  const isSelected = activeSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSessionClick(s)}
                      className={`group w-full py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#171719] text-white font-medium border border-white/8'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="truncate text-xs text-zinc-200 leading-tight">
                          {s.title || 'Untitled Case'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {s.subject.split(' ')[0]}
                        </div>
                      </div>

                      <button
                        onClick={(e) => onDeleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-400 transition-opacity"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. Footer: Educational Disclaimer Badge & User Status */}
      <div className="p-3 border-t border-white/6 space-y-2">
        {!isCollapsed && (
          <div className="p-2 rounded-lg bg-[#111113] border border-white/6 text-[10px] text-zinc-400 leading-tight">
            <span className="text-zinc-300 font-semibold block mb-0.5">Educational Practice Tool</span>
            AI-generated reasoning for moot training only. Not legal advice.
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-medium text-zinc-200 leading-none">Law Student</span>
                <span className="text-[10px] text-zinc-400">Practice Edition</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Link
              to="/login"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

    </aside>
  );
};
