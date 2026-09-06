import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Scale, ShieldCheck, ShieldAlert, Sparkles, MessageSquare, Menu, X, Mic, Clock } from 'lucide-react';

interface FeatureItem {
  id: string;
  shortLabel: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'irac',
    shortLabel: 'IRAC',
    title: 'IRAC Argument Builder',
    description: 'Turn case facts into Issue → Rule → Application → Conclusion.',
    icon: <Scale className="w-4 h-4 text-orange-400" />,
    route: '/workspace?mode=argument'
  },
  {
    id: 'counter',
    shortLabel: 'COUNTER',
    title: 'Counter-Argument',
    description: 'Ask AI to attack your position from the strongest opposing perspective.',
    icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    route: '/workspace?mode=counter'
  },
  {
    id: 'explain',
    shortLabel: 'EXPLAIN',
    title: 'Plain-Language Explainer',
    description: 'Turn dense legal reasoning into clear language with important terms defined.',
    icon: <Sparkles className="w-4 h-4 text-orange-300" />,
    route: '/workspace?mode=explain'
  },
  {
    id: 'debate',
    shortLabel: 'DEBATE',
    title: 'Virtual Debate',
    description: 'Practice a back-and-forth moot court argument against AI.',
    icon: <MessageSquare className="w-4 h-4 text-amber-300" />,
    route: '/workspace?mode=debate'
  },
  {
    id: 'voice',
    shortLabel: 'VOICE',
    title: 'Voice Practice',
    description: 'Speak your argument and rehearse oral advocacy naturally.',
    icon: <Mic className="w-4 h-4 text-orange-400" />,
    route: '/workspace?mode=debate'
  },
  {
    id: 'history',
    shortLabel: 'HISTORY',
    title: 'Practice History',
    description: 'Return to previous arguments and continue where you left off.',
    icon: <Clock className="w-4 h-4 text-zinc-300" />,
    route: '/workspace'
  }
];

const ExpandableFeatureDock: React.FC = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string>('irac');

  return (
    <div className="w-full max-w-5xl mx-auto px-2">
      <div 
        role="tablist"
        aria-label="Lexora Capabilities Dock"
        className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#09090B]/85 border border-white/8 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-x-auto no-scrollbar"
      >
        {FEATURES.map((item) => {
          const isExpanded = activeFeature === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveFeature(item.id)}
              onClick={() => {
                setActiveFeature(item.id);
                navigate('/login');
              }}
              role="tab"
              aria-selected={isExpanded}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveFeature(item.id);
                  navigate('/login');
                }
              }}
              className={`relative flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 ease-out cursor-pointer select-none text-left shrink-0 ${
                isExpanded
                  ? 'bg-[#171719] border border-white/12 shadow-lg min-w-[260px] sm:min-w-[310px]'
                  : 'bg-transparent hover:bg-white/4 border border-transparent min-w-[80px]'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors shrink-0 ${
                isExpanded ? 'bg-white/10 text-white' : 'bg-white/5 text-zinc-400'
              }`}>
                {item.icon}
              </div>

              {!isExpanded && (
                <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase font-mono">
                  {item.shortLabel}
                </span>
              )}

              {isExpanded && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white tracking-tight leading-none truncate">
                      {item.title}
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);

  const handleStartPracticing = () => {
    setIsTransitioning(true);
    // Smooth transition sequence: button scale -> subtle fade -> navigate (450-650ms)
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <div className={`relative w-full h-screen h-[100dvh] overflow-hidden bg-[#050505] text-white flex flex-col justify-between select-none transition-all duration-500 ${
      isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
    }`}>
      {/* 1. Full-Bleed CloudFront Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
      />

      {/* Subtle Dark Obsidian Mask for High Typography Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-[#050505] pointer-events-none z-1" />

      {/* 2. Top Minimal Navigation Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="Lexora Home"
        >
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-black flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-orange-500" />
            </div>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">
            Lexora
          </span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#09090B]/70 py-1.5 px-3 rounded-full border border-white/8 backdrop-blur-md text-xs text-zinc-300">
          <button
            onClick={() => setShowModeModal(true)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Product
          </button>
          <button
            onClick={() => setShowModeModal(true)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Practice Modes
          </button>
          <button
            onClick={() => setShowModeModal(true)}
            className="px-3 py-1 rounded-full hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            How It Works
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={handleStartPracticing}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer hover:scale-102"
          >
            <span>Start Practicing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Hero Section with Expandable Feature Dock */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto w-full gap-5">
        
        {/* Small Credibility Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111113]/85 border border-white/10 backdrop-blur-md text-xs text-zinc-300 shadow-sm animate-in fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider font-semibold uppercase text-zinc-200">
            AI MOOT COURT &amp; LEGAL REASONING
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Practice Law. <br />
            <span className="text-zinc-400">Think Like The Opposition.</span>
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed pt-1">
            Build structured legal arguments, challenge your reasoning, simplify complex legal language, and practice your rebuttals with AI.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={handleStartPracticing}
            className="group px-6 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] cursor-pointer"
          >
            <span>Start Practicing</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setShowModeModal(true)}
            className="px-5 py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
          >
            Explore Practice Modes
          </button>
        </div>

        {/* 4. Sleek Horizontal Expandable Feature Dock */}
        <div className="w-full pt-4">
          <ExpandableFeatureDock />
        </div>
      </main>

      {/* 5. Minimal Footer */}
      <footer className="relative z-10 shrink-0 w-full px-4 pb-4 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-zinc-300">EDUCATIONAL PRACTICE SANDBOX</span>
          <span>&bull;</span>
          <span>Not formal legal advice</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <Link to="/terms" className="hover:underline hover:text-zinc-200">Terms</Link>
          <span>&bull;</span>
          <Link to="/privacy" className="hover:underline hover:text-zinc-200">Privacy</Link>
        </div>
      </footer>

      {/* Practice Modes Modal */}
      {showModeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowModeModal(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-[#0D0D0F] border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Lexora Legal AI Capabilities</h3>
                <p className="text-xs text-zinc-400">Integrated inside the conversational workspace</p>
              </div>
              <button
                onClick={() => setShowModeModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 py-1 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <Scale className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block font-medium">IRAC Argument Mode:</strong>
                  Structures case facts into Issue, Rule (general doctrines), Application, and Conclusion.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block font-medium">Adversarial Counter-Argument:</strong>
                  Attacks your position from opposing counsel's strongest perspective and suggests rebuttals.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-orange-300 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block font-medium">1L Plain-Language Explainer:</strong>
                  Converts dense jurisprudence into simple analogies with Latin maxims explained.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block font-medium">Virtual Moot Debate:</strong>
                  Live oral advocacy room with browser voice recognition and AI opposition rebuttal.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowModeModal(false);
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors"
              >
                Enter Practice Workspace &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md md:hidden flex flex-col items-center justify-center p-6"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-w-xs rounded-2xl bg-[#0D0D0F] border border-zinc-800 p-6 flex flex-col gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="font-bold text-white text-sm">Lexora Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowModeModal(true);
              }}
              className="py-2 text-xs text-zinc-300 hover:text-white text-left"
            >
              Practice Modes
            </button>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs text-center"
            >
              Sign In to Practice
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
