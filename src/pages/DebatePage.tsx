import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { aiService, BackendHealthResponse } from '../services/aiService';
import { storageService } from '../services/storageService';
import { LegalCaseSession, DebateMessage } from '../types';
import { CASE_TEMPLATES } from '../data/templates';
import { 
  Mic, 
  MicOff, 
  Send, 
  RotateCcw, 
  Award, 
  AlertCircle,
  Volume2,
  Square,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  StopCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DebatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  // Load session or fallback to default template
  const [currentSession, setCurrentSession] = useState<LegalCaseSession>(() => {
    if (sessionId) {
      const found = storageService.getSessionById(sessionId);
      if (found) return found;
    }
    const sessions = storageService.getSessions();
    if (sessions.length > 0) return sessions[0];

    const defaultTmpl = CASE_TEMPLATES[0];
    return {
      id: 'sess-debate-default',
      title: defaultTmpl.title,
      caseFacts: defaultTmpl.facts,
      legalIssue: defaultTmpl.issue,
      subject: defaultTmpl.subject,
      jurisdiction: defaultTmpl.jurisdiction,
      legalContext: defaultTmpl.legalContext || 'India',
      mode: 'debate',
      studentPosition: defaultTmpl.studentPosition || 'FOR',
      opposingPosition: defaultTmpl.opposingPosition || 'AGAINST',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Normalize position
  const initialUserPos = (currentSession.studentPosition || 'FOR').toUpperCase().includes('AGAINST') ? 'AGAINST' : 'FOR';
  const [userPosition, setUserPosition] = useState<'FOR' | 'AGAINST'>(initialUserPos);
  const aiPosition = userPosition === 'FOR' ? 'AGAINST' : 'FOR';

  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 5;
  const [debateStatus, setDebateStatus] = useState<'idle' | 'in_progress' | 'completed'>('in_progress');
  const [messages, setMessages] = useState<DebateMessage[]>(() => {
    // If session has debate messages saved, restore them
    if (currentSession.debateSession?.messages && currentSession.debateSession.messages.length > 0) {
      return currentSession.debateSession.messages;
    }
    return [];
  });

  const [rebuttalInput, setRebuttalInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Backend Health & Provider Status
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'groq'>('auto');

  // Text-To-Speech Playback state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // End Debate Summary
  const [debateSummary, setDebateSummary] = useState<any | null>(currentSession.debateSession?.verdictFeedback || null);

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check Backend Health on mount
  useEffect(() => {
    aiService.checkHealth().then((health) => {
      if (health) setBackendHealth(health);
    });
  }, []);

  // Auto-scroll to bottom of debate
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Sync speech transcript into input box
  useEffect(() => {
    if (transcript) {
      setRebuttalInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Handle position toggle by user
  const handleTogglePosition = (newPos: 'FOR' | 'AGAINST') => {
    if (messages.length > 0) {
      if (!window.confirm('Changing your position will restart the debate exchanges. Proceed?')) {
        return;
      }
    }
    setUserPosition(newPos);
    setCurrentRound(1);
    setMessages([]);
    setDebateStatus('in_progress');
    setDebateSummary(null);

    const updated = {
      ...currentSession,
      studentPosition: newPos,
      opposingPosition: newPos === 'FOR' ? 'AGAINST' : 'FOR'
    };
    setCurrentSession(updated);
    storageService.saveSession(updated);
  };

  // Text-to-Speech Handler
  const handleListen = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural vocal presentation
    const speechText = text
      .replace(/[#*=_`~]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Build debate history array for LLM context
  const buildDebateHistory = () => {
    const history: Array<{ round: number; student: string; ai: string }> = [];
    const maxR = Math.max(...messages.map(m => m.roundNumber), 0);
    for (let r = 1; r <= maxR; r++) {
      const st = messages.find(m => m.roundNumber === r && m.speaker === 'student')?.text || '';
      const ai = messages.find(m => m.roundNumber === r && m.speaker === 'opposition')?.text || '';
      if (st || ai) {
        history.push({ round: r, student: st, ai: ai });
      }
    }
    return history;
  };

  // Submit Oral Rebuttal / Argument
  const handleSendRebuttal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rebuttalInput.trim() || isAiThinking) return;

    if (isListening) {
      stopListening();
    }

    const studentArg = rebuttalInput.trim();
    setRebuttalInput('');
    setErrorMessage(null);

    const newStudentMsg: DebateMessage = {
      id: `msg-student-${Date.now()}`,
      roundNumber: currentRound,
      speaker: 'student',
      text: studentArg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, newStudentMsg];
    setMessages(nextMessages);
    setIsAiThinking(true);

    try {
      const history = buildDebateHistory();

      const opponentReply = await aiService.runDebateRound({
        roundNumber: currentRound,
        studentArgument: studentArg,
        caseFacts: currentSession.caseFacts,
        legalIssue: currentSession.legalIssue,
        subject: currentSession.subject,
        jurisdiction: currentSession.jurisdiction,
        studentPosition: userPosition,
        debateHistory: history,
        provider: selectedProvider
      });

      const updatedExchanges = [...nextMessages, opponentReply];
      setMessages(updatedExchanges);

      // Persist to storage
      const updatedSession: LegalCaseSession = {
        ...currentSession,
        debateSession: {
          currentRound: currentRound,
          totalRounds: totalRounds,
          status: currentRound >= totalRounds ? 'completed' : 'in_progress',
          messages: updatedExchanges
        }
      };
      storageService.saveSession(updatedSession);
      setCurrentSession(updatedSession);

      if (currentRound < totalRounds) {
        setCurrentRound((prev) => prev + 1);
      } else {
        handleEndDebate();
      }
    } catch (err: any) {
      console.error('Debate error:', err);
      setErrorMessage(err?.message || 'Error generating opposing counsel argument. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Explicit End Debate & Feedback Evaluation
  const handleEndDebate = async () => {
    setIsAiThinking(true);
    try {
      const history = buildDebateHistory();
      const summary = await aiService.endDebate({
        caseFacts: currentSession.caseFacts,
        legalIssue: currentSession.legalIssue,
        userPosition: userPosition,
        debateHistory: history,
        provider: selectedProvider
      });

      setDebateSummary(summary);
      setDebateStatus('completed');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save summary in session
      const updatedSession: LegalCaseSession = {
        ...currentSession,
        debateSession: {
          currentRound,
          totalRounds,
          status: 'completed',
          messages,
          verdictFeedback: summary
        }
      };
      storageService.saveSession(updatedSession);
    } catch (err) {
      console.error('Failed to summarize debate:', err);
      setDebateStatus('completed');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleResetDebate = () => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setCurrentRound(1);
    setDebateStatus('in_progress');
    setMessages([]);
    setDebateSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      
      {/* Workspace Header */}
      <WorkspaceHeader onNewCase={() => navigate('/workspace/new')} />

      {/* Persistent Educational Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Debate Arena */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        
        {/* Top Courtroom Chamber Control Bar */}
        <div className="p-4 rounded-2xl bg-[#121214] border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-wider">
                VIRTUAL MOOT COURT CHAMBER
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                &bull; Oral Advocacy Practice
              </span>
              {backendHealth && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>AI Engine: {backendHealth.providers.gemini.configured ? 'Gemini 3.8' : 'Online'}</span>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentSession.title}
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-serif line-clamp-1">
              Issue: {currentSession.legalIssue || 'Governing legal rights and contractual obligations'}
            </p>
          </div>

          {/* Controls: Position Selector + Round Status Counter + End Debate + Reset */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Position Toggle: FOR vs AGAINST */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                onClick={() => handleTogglePosition('FOR')}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                  userPosition === 'FOR'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Represent Petitioner / Support Claim"
              >
                FOR
              </button>
              <button
                onClick={() => handleTogglePosition('AGAINST')}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                  userPosition === 'AGAINST'
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Represent Respondent / Oppose Claim"
              >
                AGAINST
              </button>
            </div>

            {/* Oral Exchange Round Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Round:</span>
              <span className="font-mono font-bold text-white">
                {currentRound} / {totalRounds}
              </span>
            </div>

            {/* End Debate Button */}
            {messages.length >= 2 && debateStatus === 'in_progress' && (
              <button
                onClick={handleEndDebate}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Conclude debate and get feedback summary"
              >
                <StopCircle className="w-3.5 h-3.5 text-orange-400" />
                <span>End Debate</span>
              </button>
            )}

            <button
              onClick={handleResetDebate}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Restart Moot Exchange"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* The Split Courtroom Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          
          {/* LEFT BENCH: Student Advocacy */}
          <div className="rounded-2xl bg-[#121214]/90 border border-white/8 p-4 flex flex-col justify-between min-h-[440px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold font-mono">
                  YOU
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Student Advocacy
                  </h2>
                  <p className="text-[10px] text-orange-400 font-mono font-semibold">
                    Position: {userPosition} (Supporting Claim)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-bold border border-zinc-800">
                {userPosition === 'FOR' ? 'Petitioner' : 'Respondent'}
              </span>
            </div>

            {/* Student Oral Submissions Log */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {messages.filter(m => m.speaker === 'student').length === 0 ? (
                /* Empty / Round 1 Welcome State */
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2 my-auto">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Court is Now in Session</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Counsel, you are appearing for the <strong className="text-orange-400 font-mono">{userPosition}</strong> side. Please present your opening oral argument via microphone or text below to commence Round 1.
                  </p>
                </div>
              ) : (
                messages.filter(m => m.speaker === 'student').map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="font-bold text-orange-400">SUBMISSION [ROUND {msg.roundNumber}]</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-serif">
                      "{msg.text}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Speech-to-Text / Oral Rebuttal Input Area */}
            <div className="pt-3 border-t border-white/5 mt-3 space-y-2">
              {/* Audio Waveform visualization when recording */}
              {isListening && (
                <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/40 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <span className="text-xs font-medium text-orange-300">Listening to oral argument…</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-orange-400 animate-pulse rounded" />
                    <span className="w-1 h-5 bg-orange-500 animate-pulse delay-75 rounded" />
                    <span className="w-1 h-2 bg-orange-400 animate-pulse delay-150 rounded" />
                    <span className="w-1 h-6 bg-orange-500 animate-pulse delay-100 rounded" />
                    <span className="w-1 h-4 bg-orange-400 animate-pulse delay-200 rounded" />
                  </div>
                </div>
              )}

              {/* Graceful Fallback Notice if speech recognition unavailable */}
              {!isSupported && (
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Voice input isn't supported in this browser. You can type your argument instead.</span>
                </div>
              )}

              <form onSubmit={handleSendRebuttal} className="flex items-end gap-2">
                <textarea
                  value={rebuttalInput}
                  onChange={(e) => setRebuttalInput(e.target.value)}
                  placeholder={
                    messages.filter(m => m.speaker === 'student').length === 0
                      ? `Deliver your opening oral argument for the ${userPosition} side...`
                      : "Speak or type your oral rebuttal to opposing counsel's points..."
                  }
                  rows={2}
                  className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed"
                />

                {isSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-orange-500 text-white border-orange-400 animate-mic-pulse'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={isListening ? 'Stop voice recording' : 'Dictate argument via microphone'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!rebuttalInput.trim() || isAiThinking || debateStatus === 'completed'}
                  className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  title="Deliver Rebuttal"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT BENCH: AI Opposition Advocacy */}
          <div className="rounded-2xl bg-[#121214]/90 border border-white/8 p-4 flex flex-col justify-between min-h-[440px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                  AI
                </div>
                <div>
                  <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Opposing Counsel
                  </h2>
                  <p className="text-[10px] text-amber-400/80 font-mono font-semibold">
                    Position: {aiPosition} (Automatic Opposite)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-bold border border-zinc-800">
                {aiPosition === 'FOR' ? 'Petitioner' : 'Respondent'}
              </span>
            </div>

            {/* Opposition Speech Log */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {messages.filter(m => m.speaker === 'opposition').length === 0 && !isAiThinking ? (
                /* Waiting State */
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2 my-auto">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Opposing Counsel Ready</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    AI opposing counsel will analyze your argument, challenge weaknesses, advance general legal reasoning from the <strong className="text-amber-400 font-mono">{aiPosition}</strong> side, and pose a difficult question.
                  </p>
                </div>
              ) : (
                messages.filter(m => m.speaker === 'opposition').map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="font-bold text-amber-400">
                        OPPOSITION BENCH [ROUND {msg.roundNumber}]
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        
                        {/* Listen (TTS) Button */}
                        <button
                          type="button"
                          onClick={() => handleListen(msg.id, msg.text)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                            speakingMessageId === msg.id
                              ? 'bg-orange-500 text-white animate-pulse'
                              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                          }`}
                          title={speakingMessageId === msg.id ? 'Stop audio' : 'Listen to AI argument'}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-serif">
                      {msg.text}
                    </div>
                  </div>
                ))
              )}

              {isAiThinking && (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3 text-xs text-amber-400 animate-in fade-in">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Opposing counsel preparing opposition &amp; bench challenge…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bench Feedback Summary when completed */}
            {debateStatus === 'completed' && (
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Moot Court Round Completed!</span>
                  </div>
                  {debateSummary?.persuasionScore && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 font-mono text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      Score: {debateSummary.persuasionScore} / 100
                    </span>
                  )}
                </div>

                {debateSummary?.overallVerdict && (
                  <p className="text-[11px] text-zinc-200 leading-relaxed">
                    {debateSummary.overallVerdict}
                  </p>
                )}

                {debateSummary?.oralAdvocacyNotes && debateSummary.oralAdvocacyNotes.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-emerald-100 list-disc list-inside">
                    {debateSummary.oralAdvocacyNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}

                {debateSummary?.suggestedImprovement && (
                  <p className="text-[11px] text-emerald-300 font-medium pt-1">
                    <strong>Tip for next round:</strong> {debateSummary.suggestedImprovement}
                  </p>
                )}

                <div className="flex justify-end pt-1 gap-2">
                  <button
                    onClick={handleResetDebate}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
                  >
                    Debate Again
                  </button>
                  <button
                    onClick={() => navigate('/workspace')}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-[11px] cursor-pointer"
                  >
                    Return to Brief &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Persistent Bottom Disclaimer */}
      <div className="py-3 px-4 text-center text-[10px] text-zinc-400 border-t border-zinc-900 bg-black flex items-center justify-center gap-3">
        <span>Educational Practice Simulation &bull; Virtual debate is designed for oral moot advocacy training only</span>
        <span className="text-zinc-600">&bull;</span>
        <span className="text-zinc-500">Zero Fabricated Citations</span>
      </div>
    </div>
  );
};

export default DebatePage;
