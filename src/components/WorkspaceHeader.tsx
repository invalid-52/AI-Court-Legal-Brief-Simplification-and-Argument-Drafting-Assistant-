import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, History, MessageSquare, Scale, BookOpen, ShieldAlert, LogOut } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';

interface WorkspaceHeaderProps {
  onNewCase?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onNewCase }) => {
  const location = useLocation();

  const isDebate = location.pathname === '/workspace/debate';
  const isHistory = location.pathname === '/workspace/history';

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 border-b border-zinc-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link 
            to="/workspace" 
            className="flex items-center gap-2.5 group"
            aria-label="Lexora Workspace"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-black flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-orange-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white tracking-tight text-sm leading-none">
                Lexora
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                MOOT STUDIO
              </span>
            </div>
          </Link>

          {/* New Case Button */}
          {onNewCase && (
            <button
              onClick={onNewCase}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs transition-colors shadow-sm"
              title="Start a new practice problem"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Practice Case</span>
            </button>
          )}
        </div>

        {/* Center: Practice Mode Links */}
        <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60 text-xs">
          <Link
            to="/workspace"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              !isDebate && !isHistory 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden md:inline">IRAC Studio</span>
          </Link>

          <Link
            to="/workspace/debate"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              isDebate 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Virtual Debate</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-orange-500/20 text-orange-400 rounded">LIVE</span>
          </Link>

          <Link
            to="/workspace/history"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              isHistory 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
          </Link>
        </nav>

        {/* Right: Educational Badge, Backend Status & Account */}
        <div className="flex items-center gap-3">
          {/* Backend Status Indicator */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
            title="Backend server connected with Gemini 3.8 active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">API:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="hidden lg:block">
            <DisclaimerBanner compact />
          </div>

          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
              JD
            </div>
            <Link
              to="/login"
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800/60"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
