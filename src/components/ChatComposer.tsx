import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  ArrowUp, 
  ChevronDown, 
  Mic, 
  MicOff, 
  X, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  FileText,
  Check
} from 'lucide-react';
import { LegalContext, PracticeMode, CaseAttachment } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface ChatComposerProps {
  onSendMessage: (text: string, attachment?: CaseAttachment) => void;
  isLoading: boolean;
  activeMode: PracticeMode;
  onSelectMode: (mode: PracticeMode) => void;
  legalContext: LegalContext;
  onSelectLegalContext: (context: LegalContext) => void;
  attachedFile?: CaseAttachment;
  onRemoveAttachment: () => void;
  onAddAttachment: (attachment: CaseAttachment) => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading,
  activeMode,
  onSelectMode,
  legalContext,
  onSelectLegalContext,
  attachedFile,
  onRemoveAttachment,
  onAddAttachment
}) => {
  const [inputText, setInputText] = useState('');
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();

  // Sync speech recognition into textarea
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Dynamic mode-aware placeholders
  const placeholderMap: Record<PracticeMode, string> = {
    argument: 'Describe the case facts, legal issue, or argument you want to practice under IRAC...',
    counter: 'State your position or argument for Lexora to attack from the strongest opposing perspective...',
    explain: 'Paste dense legal reasoning or legal doctrine to translate into accessible 1L language...',
    debate: 'State your oral moot submission or position to practice a live exchange...'
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    if (isListening) stopListening();

    onSendMessage(inputText.trim(), attachedFile);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onAddAttachment({
          name: file.name,
          size: sizeStr,
          content: content || undefined
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 relative select-none">
      
      {/* File Upload Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.md,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Composer Box */}
      <form 
        onSubmit={handleSubmit}
        className="w-full rounded-[24px] bg-[#171719] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)] p-3 sm:p-4 flex flex-col justify-between transition-all focus-within:border-white/20"
      >
        {/* Attached File Chip if uploaded */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 p-1.5 px-3 rounded-xl bg-black/40 border border-white/8 text-xs text-zinc-200 self-start animate-in fade-in">
            <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{attachedFile.name}</span>
            <span className="text-[10px] text-zinc-400 font-mono">({attachedFile.size})</span>
            <button
              type="button"
              onClick={onRemoveAttachment}
              className="ml-1 p-0.5 text-zinc-400 hover:text-white"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Listening Active Wave Notification */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between p-2 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs text-orange-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>Transcribing oral argument speech…</span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[10px] uppercase font-mono tracking-wider text-white underline"
            >
              Done
            </button>
          </div>
        )}

        {/* Autosizing Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderMap[activeMode]}
          rows={2}
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-normal min-h-[50px] max-h-48"
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/6 mt-2 gap-2 flex-wrap">
          
          {/* Left Controls: Attach + Legal Context + Mode */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111113] hover:bg-white/6 border border-white/6 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Attach legal brief, case facts, or notes (.txt, .pdf)"
            >
              <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Attach Case</span>
            </button>

            {/* Legal Context Dropdown (India / US) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContextDropdown(!showContextDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111113] hover:bg-white/6 border border-white/6 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Select Legal Jurisdiction Framework"
              >
                <span>{legalContext === 'India' ? '🇮🇳 India' : legalContext === 'United States' ? '🇺🇸 United States' : '🌐 General'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showContextDropdown && (
                <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-[#171719] border border-white/10 shadow-2xl p-1 z-40 text-xs">
                  <div
                    onClick={() => {
                      onSelectLegalContext('India');
                      setShowContextDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>🇮🇳 India (Common Law)</span>
                    {legalContext === 'India' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>
                  <div
                    onClick={() => {
                      onSelectLegalContext('United States');
                      setShowContextDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>🇺🇸 United States</span>
                    {legalContext === 'United States' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>
                  <div
                    onClick={() => {
                      onSelectLegalContext('General');
                      setShowContextDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>🌐 General Doctrines</span>
                    {legalContext === 'General' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>
                </div>
              )}
            </div>

            {/* Mode Dropdown (Argument, Counter, Explain, Debate) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111113] hover:bg-white/6 border border-white/6 text-xs text-orange-400 font-medium transition-colors cursor-pointer"
                title="Select Active Practice Mode"
              >
                {activeMode === 'argument' && <Scale className="w-3 h-3" />}
                {activeMode === 'counter' && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                {activeMode === 'explain' && <Sparkles className="w-3 h-3 text-orange-300" />}
                {activeMode === 'debate' && <MessageSquare className="w-3 h-3 text-orange-400" />}
                <span className="capitalize">{activeMode}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showModeDropdown && (
                <div className="absolute left-0 bottom-full mb-1.5 w-48 rounded-xl bg-[#171719] border border-white/10 shadow-2xl p-1 z-40 text-xs">
                  <div
                    onClick={() => {
                      onSelectMode('argument');
                      setShowModeDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-orange-400" />
                      <span>IRAC Argument</span>
                    </div>
                    {activeMode === 'argument' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>

                  <div
                    onClick={() => {
                      onSelectMode('counter');
                      setShowModeDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Counter-Argument</span>
                    </div>
                    {activeMode === 'counter' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>

                  <div
                    onClick={() => {
                      onSelectMode('explain');
                      setShowModeDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                      <span>Plain-Language</span>
                    </div>
                    {activeMode === 'explain' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>

                  <div
                    onClick={() => {
                      onSelectMode('debate');
                      setShowModeDropdown(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                      <span>Virtual Debate</span>
                    </div>
                    {activeMode === 'debate' && <Check className="w-3 h-3 text-orange-400" />}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Mic + Send Button */}
          <div className="flex items-center gap-2">
            {/* Microphone dictation */}
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-orange-500 text-white animate-mic-pulse'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title={isListening ? 'Stop recording' : 'Dictate argument speech'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Circular Send Arrow */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                (inputText.trim() || attachedFile) && !isLoading
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25'
                  : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
              title="Send to Lexora"
              aria-label="Send"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Small Legal Safety & Sandbox Hint under composer */}
      <div className="text-center py-2 text-[10px] text-zinc-400">
        Lexora provides educational &amp; moot court reasoning only &bull; No fabricated citations &bull; Not legal advice
      </div>

    </div>
  );
};
