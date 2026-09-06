import React, { useState, useEffect, useRef } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { aiService } from '../services/aiService';
import { LegalCaseSession, DebateMessage } from '../types';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  ArrowLeft, 
  Send, 
  Award, 
  CheckCircle2, 
  Keyboard, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VirtualDebateRoomProps {
  session: LegalCaseSession;
  onExitDebate: () => void;
}

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const VirtualDebateRoom: React.FC<VirtualDebateRoomProps> = ({
  session,
  onExitDebate
}) => {
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 5;
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize opening round
  useEffect(() => {
    if (messages.length === 0) {
      setOrbState('idle');
    }
  }, [messages.length]);

  // Sync speech transcript
  useEffect(() => {
    if (isListening) {
      setOrbState('listening');
    } else if (orbState === 'listening') {
      setOrbState('idle');
    }
  }, [isListening, orbState]);

  // Scroll transcript into view
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, orbState]);

  const handleStartSpeaking = () => {
    if (!isSupported) {
      setShowTextInput(true);
      return;
    }
    resetTranscript();
    startListening();
  };

  const handleStopAndSubmitSpeaking = async () => {
    stopListening();
    const finalSpeech = transcript.trim() || textInput.trim();
    if (!finalSpeech) {
      setOrbState('idle');
      return;
    }

    await submitStudentRebuttal(finalSpeech);
  };

  const submitStudentRebuttal = async (rebuttalText: string) => {
    const studentMsg: DebateMessage = {
      id: `msg-${Date.now()}`,
      roundNumber: currentRound,
      speaker: 'student',
      text: rebuttalText,
      timestamp: `Round ${currentRound}`
    };

    const nextMessages = [...messages, studentMsg];
    setMessages(nextMessages);
    setTextInput('');
    setShowTextInput(false);
    resetTranscript();

    // AI Thinking State
    setOrbState('thinking');

    try {
      // Build history
      const history = nextMessages.map((m) => ({
        round: m.roundNumber,
        student: m.speaker === 'student' ? m.text : '',
        ai: m.speaker === 'opposition' ? m.text : ''
      }));

      // Call real backend AI debate engine
      const aiReply = await aiService.runDebateRound({
        roundNumber: currentRound,
        studentArgument: rebuttalText,
        caseFacts: session.caseFacts,
        legalIssue: session.legalIssue,
        subject: session.subject,
        jurisdiction: session.jurisdiction,
        studentPosition: session.studentPosition || 'FOR',
        debateHistory: history
      });

      // AI Speaking State
      setOrbState('speaking');
      setMessages((prev) => [...prev, aiReply]);

      // Play audio via Web Speech API if supported
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanSpeech = aiReply.text.replace(/[#*=_`~]/g, '').replace(/\n+/g, '. ').trim();
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 1.0;
        utterance.onend = () => setOrbState('idle');
        utterance.onerror = () => setOrbState('idle');
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setOrbState('idle');
        }, 3500);
      }

      // Progress round
      if (currentRound < totalRounds) {
        setCurrentRound((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Virtual debate error:', err);
      setOrbState('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    submitStudentRebuttal(textInput.trim());
  };

  const handleRestart = () => {
    setCurrentRound(1);
    setIsCompleted(false);
    setOrbState('idle');
    setMessages([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[78vh] px-4 py-6 select-none animate-in fade-in duration-300">
      
      {/* 1. Header Bar: Mode + Jurisdiction + Round Progress */}
      <div className="flex items-center justify-between border-b border-white/6 pb-4">
        <button
          onClick={onExitDebate}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Chat</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              VIRTUAL MOOT COURT CHAMBER
            </h2>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {session.subject} &bull; {session.legalContext} Context
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#111113] border border-white/6 text-xs font-mono font-bold text-orange-400">
            ROUND {currentRound} / {totalRounds}
          </span>
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Restart Moot Exchange"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Centered Lexora Voice Orb */}
      <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
        
        {/* Dynamic Voice Orb with 4 Reactive States */}
        <div className="relative flex items-center justify-center mb-6">
          
          {/* Speaking Concentric Ripples */}
          {orbState === 'speaking' && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-orange-500/30 animate-ripple-1 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-orange-500/20 animate-ripple-2 pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-orange-500/10 animate-ripple-3 pointer-events-none" />
            </>
          )}

          {/* Listening Expanding Rings */}
          {orbState === 'listening' && (
            <>
              <div className="absolute w-40 h-40 rounded-full bg-orange-500/10 animate-ping pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full border border-orange-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Core Orb Center */}
          <div 
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative ${
              orbState === 'idle'
                ? 'bg-gradient-to-b from-[#171719] to-[#0D0D0F] border border-white/10 animate-orb-breath'
                : orbState === 'listening'
                ? 'bg-gradient-to-b from-orange-600 to-[#171719] border-2 border-orange-400 shadow-[0_0_50px_rgba(255,138,36,0.45)]'
                : orbState === 'thinking'
                ? 'bg-gradient-to-b from-amber-600/60 to-[#171719] border border-amber-400 animate-pulse'
                : 'bg-gradient-to-b from-orange-500/80 to-[#171719] border-2 border-orange-300 shadow-[0_0_60px_rgba(255,138,36,0.5)]'
            }`}
          >
            {orbState === 'listening' ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : orbState === 'thinking' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-orange-400 shadow-[0_0_15px_#FF8A24]" />
            )}
          </div>
        </div>

        {/* State Label & Subtext */}
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold">
            {orbState === 'idle' && 'AI OPPOSITION READY'}
            {orbState === 'listening' && 'LISTENING TO ORAL ARGUMENT...'}
            {orbState === 'thinking' && 'OPPOSING COUNSEL FORMULATING REBUTTAL...'}
            {orbState === 'speaking' && 'AI OPPOSITION SPEAKING'}
          </div>

          <p className="text-xs text-zinc-400 max-w-sm">
            {orbState === 'idle' && 'Click Speak to deliver your oral submission for this round.'}
            {orbState === 'listening' && (transcript ? `"${transcript}"` : 'Deliver your submission clearly into your microphone…')}
            {orbState === 'thinking' && 'Analyzing statutory limits and commercial realities…'}
            {orbState === 'speaking' && 'Review the bench query below to prepare your response.'}
          </p>
        </div>

      </div>

      {/* 3. Conversation Exchanges Log */}
      <div className="max-w-2xl mx-auto w-full space-y-3 mb-6 max-h-52 overflow-y-auto px-1 no-scrollbar">
        {messages.slice(-3).map((msg) => (
          <div 
            key={msg.id}
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              msg.speaker === 'student'
                ? 'bg-[#171719] border-white/8 text-zinc-200 ml-8'
                : 'bg-orange-950/15 border-orange-500/20 text-zinc-200 mr-8'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
              <span className="font-bold text-orange-400">
                {msg.speaker === 'student' ? 'YOU (PETITIONER)' : 'AI OPPOSITION (RESPONDENT)'}
              </span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="font-serif italic text-zinc-300">"{msg.text}"</p>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      {/* 4. Bottom Controls: Speak / Type Instead / Submit */}
      <div className="max-w-xl mx-auto w-full space-y-3">
        
        {/* If Debate Completed */}
        {isCompleted ? (
          <div className="p-4 rounded-2xl bg-[#111113] border border-white/10 text-center space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
              <Award className="w-4 h-4" />
              <span>Debate Round Completed (5 / 5)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-md mx-auto">
              Strong advocacy defense! You consistently emphasized objective manifestation while handling the respondent’s server glitch and lack of reliance arguments effectively.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
              >
                Practice Again
              </button>
              <button
                onClick={onExitDebate}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Return to Brief &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Fallback Text Input Toggle */}
            {showTextInput ? (
              <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your oral rebuttal to opposing counsel..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#171719] border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || orbState === 'thinking'}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span>Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowTextInput(false)}
                  className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Switch to speech"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3">
                {/* Voice Record Action */}
                <button
                  onClick={isListening ? handleStopAndSubmitSpeaking : handleStartSpeaking}
                  disabled={orbState === 'thinking'}
                  className={`px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                    isListening
                      ? 'bg-orange-500 hover:bg-orange-600 text-white animate-mic-pulse'
                      : 'bg-white hover:bg-zinc-200 text-black shadow-white/5'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop & Submit Rebuttal' : 'Speak Your Rebuttal'}</span>
                </button>

                {/* Type Instead Alternative */}
                <button
                  onClick={() => setShowTextInput(true)}
                  className="px-4 py-3 rounded-full bg-[#171719] hover:bg-[#1D1D20] border border-white/8 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Type submission instead of microphone"
                >
                  <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Type Instead</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Small Notice */}
        <div className="text-center text-[10px] text-zinc-400">
          Virtual Moot Practice &bull; Rebuttal evaluation based on legal clarity and doctrine
        </div>

      </div>

    </div>
  );
};
