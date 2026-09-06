import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageItem } from '../components/ChatMessageItem';
import { VirtualDebateRoom } from '../components/VirtualDebateRoom';
import { ArgumentStrengthModal } from '../components/ArgumentStrengthModal';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { IRACViewer } from '../components/IRACViewer';
import { CounterArgumentViewer } from '../components/CounterArgumentViewer';
import { PlainLanguageViewer } from '../components/PlainLanguageViewer';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import { CASE_TEMPLATES } from '../data/templates';
import { 
  LegalCaseSession, 
  ChatMessage, 
  PracticeMode, 
  LegalContext, 
  CaseAttachment,
  IRACArgument
} from '../types';
import { 
  Menu, 
  ChevronDown, 
  Download, 
  Award, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare,
  Check,
  CheckCircle2,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const urlMode = searchParams.get('mode') as PracticeMode | null;

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sessions list from storage
  const [sessions, setSessions] = useState<LegalCaseSession[]>([]);

  // Active session
  const [session, setSession] = useState<LegalCaseSession>(() => {
    if (sessionId) {
      const found = storageService.getSessionById(sessionId);
      if (found) return found;
    }
    const all = storageService.getSessions();
    if (all.length > 0) return all[0];

    const defaultTmpl = CASE_TEMPLATES[0];
    return {
      id: `sess-${Date.now()}`,
      title: defaultTmpl.title,
      caseFacts: defaultTmpl.facts,
      legalIssue: defaultTmpl.issue,
      subject: defaultTmpl.subject,
      jurisdiction: defaultTmpl.jurisdiction,
      legalContext: defaultTmpl.legalContext,
      mode: urlMode || 'argument',
      studentPosition: defaultTmpl.studentPosition,
      opposingPosition: defaultTmpl.opposingPosition,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [activeMode, setActiveMode] = useState<PracticeMode>(urlMode || session.mode || 'argument');
  const [legalContext, setLegalContext] = useState<LegalContext>(session.legalContext || 'India');
  const [contextNotification, setContextNotification] = useState<string | null>(null);

  // Active attached file
  const [attachedFile, setAttachedFile] = useState<CaseAttachment | undefined>(session.attachment);

  // Loading & Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  // Workspace Preparation state (for new case intake)
  const isGeneratingRequested = searchParams.get('generating') === 'true';
  const [isPreparingWorkspace, setIsPreparingWorkspace] = useState(false);
  const [prepStep, setPrepStep] = useState<number>(1);

  // Modals
  const [showStrengthModal, setShowStrengthModal] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-run preparation when case is created from intake form
  useEffect(() => {
    const runCasePreparation = async () => {
      if (isGeneratingRequested && session.caseFacts && (!session.iracArgument || (session.messages?.length === 0 && !session.iracArgument))) {
        setIsPreparingWorkspace(true);
        setPrepStep(1); // Case facts received

        await new Promise(r => setTimeout(r, 450));
        setPrepStep(2); // Legal issue identified

        await new Promise(r => setTimeout(r, 500));
        setPrepStep(3); // Case structure prepared

        await new Promise(r => setTimeout(r, 550));
        setPrepStep(4); // Preparing IRAC workspace

        try {
          const irac = await aiService.generateArgument({
            facts: session.caseFacts,
            issue: session.legalIssue || session.title,
            subject: session.subject,
            jurisdiction: session.jurisdiction,
            studentPosition: session.studentPosition,
            opposingPosition: session.opposingPosition
          });

          const counter = await aiService.generateCounterArgument({
            facts: session.caseFacts,
            issue: session.legalIssue,
            subject: session.subject,
            jurisdiction: session.jurisdiction,
            iracArgument: irac,
            studentPosition: session.studentPosition
          });

          const explainer = await aiService.explainArgument({
            facts: session.caseFacts,
            issue: session.legalIssue,
            subject: session.subject,
            iracArgument: irac
          });

          const strength = await aiService.scoreArgument({
            facts: session.caseFacts,
            issue: irac.issue,
            subject: session.subject,
            studentPosition: session.studentPosition,
            iracArgument: irac
          });

          setPrepStep(5); // Preparing practice tools
          await new Promise(r => setTimeout(r, 400));

          const updatedSession: LegalCaseSession = {
            ...session,
            iracArgument: irac,
            counterArgument: counter,
            plainLanguage: explainer,
            strengthScore: strength,
            updatedAt: new Date().toISOString()
          };

          setSession(updatedSession);
          storageService.saveSession(updatedSession);
          setSessions(storageService.getSessions());

          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (err) {
          console.error('Preparation error', err);
        } finally {
          setIsPreparingWorkspace(false);
        }
      }
    };

    runCasePreparation();
  }, [sessionId, isGeneratingRequested]);


  // Auto-load sessions on mount
  useEffect(() => {
    setSessions(storageService.getSessions());
  }, []);

  // Sync session changes from URL parameter
  useEffect(() => {
    if (sessionId) {
      const found = storageService.getSessionById(sessionId);
      if (found) {
        setSession(found);
        setActiveMode(found.mode || 'argument');
        setLegalContext(found.legalContext || 'India');
        setAttachedFile(found.attachment);
      }
    }
  }, [sessionId]);

  // Sync mode if query parameter exists
  useEffect(() => {
    if (urlMode) {
      setActiveMode(urlMode);
    }
  }, [urlMode]);

  // Scroll to bottom of message stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  // Change Legal Context with subtle notification
  const handleSelectLegalContext = (context: LegalContext) => {
    setLegalContext(context);
    setContextNotification(`Legal context changed to ${context === 'India' ? 'India (Common Law)' : context === 'United States' ? 'United States' : 'General Doctrines'}. Future responses will be framed accordingly.`);
    setTimeout(() => setContextNotification(null), 3500);

    const updated = {
      ...session,
      legalContext: context,
      jurisdiction: context === 'India' 
        ? 'India (Common Law)' as const 
        : context === 'United States' 
        ? 'United States (Federal/State)' as const 
        : 'General Common Law Principles' as const
    };
    setSession(updated);
    storageService.saveSession(updated);
  };

  // Submit prompt / argument into chat stream
  const handleSendMessage = async (text: string, attachment?: CaseAttachment) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      mode: activeMode,
      attachmentName: attachment?.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...(session.messages || []), userMsg];
    const workingSession = {
      ...session,
      caseFacts: session.caseFacts ? session.caseFacts + '\n\n' + text : text,
      attachment: attachment || session.attachment,
      messages: updatedMessages
    };

    setSession(workingSession);
    setIsLoading(true);

    // Multi-step streaming simulation
    setLoadingStep('Understanding case facts...');
    setTimeout(() => setLoadingStep('Identifying legal issues...'), 400);
    setTimeout(() => setLoadingStep('Applying general legal doctrines...'), 800);
    setTimeout(() => setLoadingStep('Structuring response...'), 1200);

    try {
      if (activeMode === 'argument') {
        const irac = await aiService.generateArgument({
          facts: workingSession.caseFacts,
          issue: workingSession.legalIssue || text.slice(0, 80),
          subject: workingSession.subject,
          jurisdiction: workingSession.jurisdiction,
          studentPosition: workingSession.studentPosition
        });

        const strength = await aiService.scoreArgument({
          facts: workingSession.caseFacts,
          issue: irac.issue,
          subject: workingSession.subject,
          studentPosition: workingSession.studentPosition,
          iracArgument: irac
        });

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: `I analyzed the case under ${workingSession.jurisdiction} and structured your IRAC argument.`,
          mode: 'argument',
          iracData: irac,
          strengthScore: strength,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalSession: LegalCaseSession = {
          ...workingSession,
          iracArgument: irac,
          strengthScore: strength,
          messages: [...updatedMessages, aiMsg],
          updatedAt: new Date().toISOString()
        };

        setSession(finalSession);
        storageService.saveSession(finalSession);
        setSessions(storageService.getSessions());

        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.75 }
        });

      } else if (activeMode === 'counter') {
        const counter = await aiService.generateCounterArgument({
          facts: workingSession.caseFacts,
          issue: workingSession.legalIssue,
          subject: workingSession.subject,
          jurisdiction: workingSession.jurisdiction,
          iracArgument: workingSession.iracArgument,
          studentPosition: workingSession.studentPosition
        });

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: `Let me attack that position from opposing counsel's strongest perspective.`,
          mode: 'counter',
          counterData: counter,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalSession = {
          ...workingSession,
          counterArgument: counter,
          messages: [...updatedMessages, aiMsg],
          updatedAt: new Date().toISOString()
        };

        setSession(finalSession);
        storageService.saveSession(finalSession);
        setSessions(storageService.getSessions());

      } else if (activeMode === 'explain') {
        const explainer = await aiService.explainArgument({
          facts: workingSession.caseFacts,
          issue: workingSession.legalIssue,
          subject: workingSession.subject,
          iracArgument: workingSession.iracArgument
        });

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: `Here is the plain-language translation of this reasoning for first-year law students.`,
          mode: 'explain',
          plainData: explainer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalSession = {
          ...workingSession,
          plainLanguage: explainer,
          messages: [...updatedMessages, aiMsg],
          updatedAt: new Date().toISOString()
        };

        setSession(finalSession);
        storageService.saveSession(finalSession);
        setSessions(storageService.getSessions());

      } else if (activeMode === 'debate') {
        // Debate mode routes into the Virtual Debate room
        setActiveMode('debate');
      }

    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Quick Starter Prompts in Empty State
  const handleStarterPrompt = (type: 'irac' | 'counter' | 'explain' | 'debate') => {
    if (type === 'irac') {
      setActiveMode('argument');
      handleSendMessage(session.caseFacts || CASE_TEMPLATES[0].facts);
    } else if (type === 'counter') {
      setActiveMode('counter');
      handleSendMessage('Challenge my argument from the strongest opposing perspective.');
    } else if (type === 'explain') {
      setActiveMode('explain');
      handleSendMessage('Explain this legal argument as if I am a first-year law student.');
    } else if (type === 'debate') {
      setActiveMode('debate');
    }
  };

  const handleNewPracticeCase = () => {
    navigate('/workspace/new');
  };

  const handleUpdateArgument = (newArgument: IRACArgument) => {
    const updated = {
      ...session,
      iracArgument: newArgument,
      updatedAt: new Date().toISOString()
    };
    setSession(updated);
    storageService.saveSession(updated);
    setSessions(storageService.getSessions());
  };

  const handleSelectSampleCase = () => {
    const tmpl = CASE_TEMPLATES[0];
    const sampleSess: LegalCaseSession = {
      id: `sess-sample-${Date.now()}`,
      title: tmpl.title,
      caseFacts: tmpl.facts,
      legalIssue: tmpl.issue,
      subject: tmpl.subject,
      jurisdiction: tmpl.jurisdiction,
      legalContext: tmpl.legalContext,
      mode: 'argument',
      studentPosition: tmpl.studentPosition,
      opposingPosition: tmpl.opposingPosition,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSession(sampleSess);
    setAttachedFile(undefined);
    setActiveMode('argument');
    setLegalContext(tmpl.legalContext);
    storageService.saveSession(sampleSess);
    setSessions(storageService.getSessions());
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteSession(id);
    const updated = storageService.getSessions();
    setSessions(updated);
    if (session.id === id && updated.length > 0) {
      setSession(updated[0]);
    }
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(session);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden selection:bg-orange-500/25">
      
      {/* 1. Collapsible Obsidian Sidebar (Desktop) */}
      <div className="hidden md:flex">
        <Sidebar
          sessions={sessions}
          activeSessionId={session.id}
          onSelectSession={(s) => setSession(s)}
          onNewPracticeCase={handleNewPracticeCase}
          onSelectSampleCase={handleSelectSampleCase}
          activeMode={activeMode}
          onSelectMode={(m) => setActiveMode(m)}
          onDeleteSession={handleDeleteSession}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              sessions={sessions}
              activeSessionId={session.id}
              onSelectSession={(s) => setSession(s)}
              onNewPracticeCase={handleNewPracticeCase}
              onSelectSampleCase={handleSelectSampleCase}
              activeMode={activeMode}
              onSelectMode={(m) => setActiveMode(m)}
              onDeleteSession={handleDeleteSession}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main Workspace Canvas */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#050505]">
        
        {/* Minimal Top Bar */}
        <header className="h-12 border-b border-white/6 px-4 flex items-center justify-between gap-3 bg-[#080809]/80 backdrop-blur-md shrink-0">
          
          {/* Left: Mobile menu toggle + Case Title */}
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1 text-zinc-400 hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-sm">
              {session.title || 'Untitled Case Practice'}
            </span>
          </div>

          {/* Center: Legal Context Selector */}
          <div className="relative">
            <button
              onClick={() => setShowContextDropdown(!showContextDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111113] hover:bg-white/6 border border-white/6 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-xs">{legalContext === 'India' ? '🇮🇳 India' : legalContext === 'United States' ? '🇺🇸 United States' : '🌐 General'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showContextDropdown && (
              <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5 w-44 rounded-xl bg-[#171719] border border-white/10 shadow-2xl p-1 z-50 text-xs">
                <div
                  onClick={() => {
                    handleSelectLegalContext('India');
                    setShowContextDropdown(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                >
                  <span>🇮🇳 India (Common Law)</span>
                  {legalContext === 'India' && <Check className="w-3 h-3 text-orange-400" />}
                </div>
                <div
                  onClick={() => {
                    handleSelectLegalContext('United States');
                    setShowContextDropdown(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                >
                  <span>🇺🇸 United States</span>
                  {legalContext === 'United States' && <Check className="w-3 h-3 text-orange-400" />}
                </div>
                <div
                  onClick={() => {
                    handleSelectLegalContext('General');
                    setShowContextDropdown(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                >
                  <span>🌐 General Principles</span>
                  {legalContext === 'General' && <Check className="w-3 h-3 text-orange-400" />}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStrengthModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-medium transition-colors cursor-pointer"
              title="Practice Diagnostic Score"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Score (84)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Export Brief as PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Legal Context Change Confirmation Notification */}
        {contextNotification && (
          <div className="bg-[#111113] border-b border-orange-500/30 px-4 py-1.5 text-center text-xs text-orange-300 transition-all animate-in fade-in">
            {contextNotification}
          </div>
        )}

        {/* 3. Center Screen: Workspace Preparation OR Viewers OR Conversation Stream */}
        {isPreparingWorkspace ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#121214] border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  Preparing your practice workspace
                </h2>
              </div>

              <div className="space-y-3 text-left text-xs">
                <div className="flex items-center gap-3">
                  {prepStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-orange-400 flex items-center justify-center text-[10px] text-orange-400 font-bold shrink-0">1</div>
                  )}
                  <span className={prepStep >= 1 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                    Case facts received
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {prepStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : prepStep === 2 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className={prepStep >= 2 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                    Legal issue identified
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {prepStep > 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : prepStep === 3 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className={prepStep >= 3 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                    Case structure prepared
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {prepStep > 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : prepStep === 4 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className={prepStep >= 4 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                    Preparing IRAC workspace
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {prepStep >= 5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className={prepStep >= 5 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                    Preparing practice tools
                  </span>
                </div>
              </div>

              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(prepStep / 5) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-500 italic">
                Educational reasoning mode &bull; General common law doctrines
              </p>
            </div>
          </div>
        ) : activeMode === 'debate' ? (
          <div className="flex-1 overflow-y-auto">
            <VirtualDebateRoom
              session={session}
              onExitDebate={() => setActiveMode('argument')}
            />
          </div>
        ) : activeMode === 'counter' && session.counterArgument ? (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <CounterArgumentViewer
              session={session}
              counterData={session.counterArgument}
              onStartVirtualDebate={() => setActiveMode('debate')}
            />
          </div>
        ) : activeMode === 'explain' && session.plainLanguage ? (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <PlainLanguageViewer
              session={session}
              data={session.plainLanguage}
            />
          </div>
        ) : activeMode === 'argument' && session.iracArgument ? (
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <IRACViewer
              session={session}
              argument={session.iracArgument}
              onOpenStrengthScoring={() => setShowStrengthModal(true)}
              onSwitchToCounter={() => setActiveMode('counter')}
              onSwitchToExplainer={() => setActiveMode('explain')}
              onUpdateArgument={handleUpdateArgument}
            />

            {/* If there are follow-up messages */}
            {session.messages && session.messages.length > 0 && (
              <div className="max-w-4xl mx-auto w-full pt-6 border-t border-white/8 space-y-3">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                  Practice Dialogue
                </span>
                {session.messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    session={session}
                    onOpenStrengthModal={() => setShowStrengthModal(true)}
                    onSwitchToCounter={() => setActiveMode('counter')}
                    onSwitchToExplainer={() => setActiveMode('explain')}
                    onEnterDebate={() => setActiveMode('debate')}
                  />
                ))}
              </div>
            )}

            {/* Multi-step Thinking Streaming Indicator */}
            {isLoading && (
              <div className="max-w-4xl mx-auto flex items-center gap-2.5 py-4 text-xs text-orange-400 animate-in fade-in">
                <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="font-medium">{loadingStep || 'Lexora analyzing legal doctrine…'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto w-full">
              
              {/* Empty State if No Messages */}
              {(!session.messages || session.messages.length === 0) && (
                <div className="h-[55vh] flex flex-col items-center justify-center text-center space-y-4 select-none animate-in fade-in">
                  
                  {/* Subtle Lexora Intelligent Mark */}
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md mb-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      What are we arguing today?
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Give Lexora the case facts, attach the case file, choose your legal context ({legalContext}), and start practicing.
                    </p>
                  </div>

                  {/* 4 Interactive Starter Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 w-full max-w-xl">
                    <button
                      onClick={() => handleStarterPrompt('irac')}
                      className="p-2.5 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-left transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <Scale className="w-4 h-4 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-zinc-200">Build an IRAC</span>
                      <span className="text-[10px] text-zinc-400">Structure case facts</span>
                    </button>

                    <button
                      onClick={() => handleStarterPrompt('counter')}
                      className="p-2.5 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-left transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-zinc-200">Challenge Argument</span>
                      <span className="text-[10px] text-zinc-400">Adversarial defense</span>
                    </button>

                    <button
                      onClick={() => handleStarterPrompt('explain')}
                      className="p-2.5 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-left transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-orange-300 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-zinc-200">Explain This</span>
                      <span className="text-[10px] text-zinc-400">1L plain language</span>
                    </button>

                    <button
                      onClick={() => handleStarterPrompt('debate')}
                      className="p-2.5 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-left transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-zinc-200">Start a Debate</span>
                      <span className="text-[10px] text-zinc-400">Live voice moot orb</span>
                    </button>
                  </div>

                  {/* Hypothetical Practice Sandbox Note */}
                  <div className="pt-4 text-[10px] text-zinc-400 font-mono">
                    HYPOTHETICAL PRACTICE SANDBOX &bull; AVOID SENSITIVE MATTERS
                  </div>

                </div>
              )}

              {/* Chat Messages List */}
              {session.messages && session.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  session={session}
                  onOpenStrengthModal={() => setShowStrengthModal(true)}
                  onSwitchToCounter={() => {
                    setActiveMode('counter');
                    handleSendMessage('Attack my argument from the strongest opposing perspective.');
                  }}
                  onSwitchToExplainer={() => {
                    setActiveMode('explain');
                    handleSendMessage('Explain this IRAC argument in simple 1L terms with key Latin phrases defined.');
                  }}
                  onEnterDebate={() => setActiveMode('debate')}
                />
              ))}

              {/* Multi-step Thinking Streaming Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 py-4 text-xs text-orange-400 animate-in fade-in">
                  <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="font-medium">{loadingStep || 'Lexora analyzing legal doctrine…'}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* 4. Bottom Fixed Composer (Only in normal chat modes) */}
        {activeMode !== 'debate' && (
          <div className="shrink-0 pb-2">
            <ChatComposer
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              activeMode={activeMode}
              onSelectMode={(m) => setActiveMode(m)}
              legalContext={legalContext}
              onSelectLegalContext={handleSelectLegalContext}
              attachedFile={attachedFile}
              onRemoveAttachment={() => setAttachedFile(undefined)}
              onAddAttachment={(att) => setAttachedFile(att)}
            />
          </div>
        )}

      </div>

      {/* 5. Argument Strength Modal */}
      {showStrengthModal && (
        <ArgumentStrengthModal
          scoreData={session.strengthScore || {
            overallScore: 84,
            breakdown: {
              structureScore: 92,
              legalReasoningScore: 85,
              factApplicationScore: 82,
              counterArgumentReadinessScore: 77
            },
            feedbackSuggestions: [
              'Exemplary IRAC framing: Issue and Rule sections are clearly delineated.',
              'Cite exact timeline events (4:30 PM vs 5:10 PM) in Application to demonstrate unreasonableness of revocation.',
              'Prepare for oral moot questions on the commercial reasonableness standard.'
            ],
            disclaimer: 'Informal educational practice feedback only — not an official academic grade or legal opinion.'
          }}
          onClose={() => setShowStrengthModal(false)}
        />
      )}

    </div>
  );
};
