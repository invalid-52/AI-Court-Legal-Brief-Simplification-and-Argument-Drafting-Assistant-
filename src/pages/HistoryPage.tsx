import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { storageService } from '../services/storageService';
import { LegalCaseSession, SubjectArea } from '../types';
import { 
  Search, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Scale, 
  Filter, 
  Download, 
  Plus, 
  FolderOpen 
} from 'lucide-react';
import { exportService } from '../services/exportService';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<LegalCaseSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  useEffect(() => {
    setSessions(storageService.getSessions());
  }, []);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved practice case?')) {
      storageService.deleteSession(id);
      setSessions(storageService.getSessions());
    }
  };

  const handleOpenSession = (session: LegalCaseSession) => {
    navigate(`/workspace?session=${session.id}`);
  };

  const handleExportPDF = (session: LegalCaseSession, e: React.MouseEvent) => {
    e.stopPropagation();
    exportService.exportToPDF(session);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.caseFacts.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || s.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Top Header */}
      <WorkspaceHeader onNewCase={() => navigate('/workspace')} />

      {/* Persistent Educational Disclaimer */}
      <DisclaimerBanner />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">
        
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-wider">
                SESSION ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Practice History &amp; Saved Briefs
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Revisit, compare arguments, and reopen previous moot court problem sets.
            </p>
          </div>

          <button
            onClick={() => navigate('/workspace/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors self-start shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Practice Case</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search briefs by title, facts, or legal principles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter by subject"
              className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Subject Areas</option>
              <option value="Contract Law">Contract Law</option>
              <option value="Criminal Law">Criminal Law</option>
              <option value="Constitutional Law">Constitutional Law</option>
              <option value="Tort Law">Tort Law</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#121214] border border-zinc-800/80 space-y-3">
            <FolderOpen className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Saved Sessions Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No previous moot cases match your search query. Try starting a new problem in the IRAC Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenSession(session)}
                className="group p-5 rounded-2xl bg-[#121214] border border-white/8 hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-semibold">
                        {session.subject}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {session.jurisdiction.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                    {session.title || 'Untitled Case Practice'}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {session.caseFacts}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                  <span className="text-[11px] font-medium text-orange-400 group-hover:underline flex items-center gap-1">
                    <span>Reopen in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleExportPDF(session, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/50 text-zinc-400 hover:text-red-400"
                      title="Delete Brief"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-zinc-400 border-t border-zinc-900 bg-black">
        Educational Practice Environment &bull; Local Storage Session History
      </footer>
    </div>
  );
};
