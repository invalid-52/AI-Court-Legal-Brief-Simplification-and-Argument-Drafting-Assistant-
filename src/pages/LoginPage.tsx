import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [firstName, setFirstName] = useState('Advocate');
  const [lastName, setLastName] = useState('Learner');
  const [email, setEmail] = useState('student@lawschool.edu');
  const [password, setPassword] = useState('mootcourt2026');
  const [showPassword, setShowPassword] = useState(false);

  // Mandatory Educational Terms acceptance
  const [agreedToEducationalDisclaimer, setAgreedToEducationalDisclaimer] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid academic or professional email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (!isLoginMode && (!agreedToEducationalDisclaimer || !agreedToTerms)) {
      setErrorMessage('You must accept the educational disclaimer and terms.');
      return;
    }

    setIsLoading(true);

    // Smooth transition sequence into workspace (500–800ms)
    setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/workspace');
      }, 400);
    }, 450);
  };

  const isButtonDisabled = !isLoginMode && (!agreedToEducationalDisclaimer || !agreedToTerms || isLoading);

  return (
    <div className={`min-h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-x-hidden transition-all duration-500 ${
      isTransitioning ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
    }`}>
      
      {/* LEFT PANEL: 50% on Desktop with CloudFront Video */}
      <div className="hidden md:flex md:w-[48%] lg:w-[50%] relative bg-[#080809] flex-col justify-between p-12 overflow-hidden border-r border-white/6">
        {/* Exact CloudFront Video without tint mask */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
        />

        {/* Top brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-black flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-orange-500" />
              </div>
            </div>
            <span className="font-semibold text-white tracking-tight text-xs">
              Lexora
            </span>
          </Link>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 max-w-md space-y-6 my-auto pt-8">
          <div className="bg-black/70 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-2">
            <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-wider">
              LEXORA
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Prepare before you perform.
            </h2>
            <p className="text-zinc-300 text-xs lg:text-sm leading-relaxed">
              Build your reasoning, challenge your position, and rehearse your rebuttal before the real moot.
            </p>
          </div>

          {/* 3 Sequential Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/65 border border-white/8 backdrop-blur-md">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <span className="text-xs font-medium text-zinc-200">
                Format facts and issues into structured IRAC briefs
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/65 border border-white/8 backdrop-blur-md">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <span className="text-xs font-medium text-zinc-200">
                Inspect the strongest adversarial counter-arguments
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/65 border border-white/8 backdrop-blur-md">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <span className="text-xs font-medium text-zinc-200">
                Practice oral advocacy in the Virtual Debate Room
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-zinc-400 bg-black/60 px-3 py-1 rounded-full inline-block backdrop-blur-sm self-start">
          Educational Practice Sandbox &bull; For Law Students
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#080809]">
        <div className="w-full max-w-md space-y-5">
          
          {/* Header */}
          <div>
            <div className="md:hidden mb-4 flex items-center gap-2">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-black" />
                </div>
                <span className="font-bold text-white text-sm">Lexora</span>
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isLoginMode ? 'Welcome to Lexora' : 'Create your practice workspace'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isLoginMode 
                ? 'Sign in to access your previous briefs and debate sessions.'
                : 'Set up your workspace and start training your legal reasoning.'}
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/workspace')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <i className="fa-brands fa-google text-xs text-white" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/workspace')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#111113] hover:bg-[#171719] border border-white/6 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <i className="fa-brands fa-github text-xs text-white" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/6" />
            </div>
            <span className="relative px-3 bg-[#080809] text-[9px] uppercase font-mono tracking-widest text-zinc-400">
              OR
            </span>
          </div>

          {/* Error feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111113] border border-white/8 focus:border-white/30 focus:outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                    placeholder="Advocate"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111113] border border-white/8 focus:border-white/30 focus:outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                    placeholder="Learner"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">Academic / Law School Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111113] border border-white/8 focus:border-white/30 focus:outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                placeholder="student@lawschool.edu"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-medium text-zinc-300">Password</label>
                <span className="text-[10px] text-zinc-400">Min. 8 chars</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-[#111113] border border-white/8 focus:border-white/30 focus:outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* MANDATORY EDUCATIONAL TERMS ACCEPTANCE (Section 10) */}
            {!isLoginMode && (
              <div className="space-y-2.5 pt-1">
                {/* Required Checkbox 1: Educational Sandbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0D0D0F] border border-white/8 hover:border-white/15 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToEducationalDisclaimer}
                    onChange={(e) => setAgreedToEducationalDisclaimer(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="text-xs text-zinc-300 leading-snug">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-0.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Required Educational Notice:</span>
                    </div>
                    I understand that Lexora provides educational and moot court practice material only and is not a substitute for professional legal advice or professional representation.
                  </div>
                </label>

                {/* Required Checkbox 2: Terms & Privacy */}
                <label className="flex items-start gap-2 px-2 py-0.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="text-xs text-zinc-400">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-zinc-200 underline hover:text-white">
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-zinc-200 underline hover:text-white">
                      Privacy Policy
                    </Link>.
                  </div>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                isButtonDisabled
                  ? 'bg-zinc-800/80 text-zinc-400 cursor-not-allowed border border-white/5'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 cursor-pointer active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Entering Workspace…</span>
                </div>
              ) : (
                <>
                  <span>{isLoginMode ? 'Sign In to Workspace' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            {isLoginMode ? (
              <span>
                New to Lexora?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(false);
                    setErrorMessage(null);
                  }}
                  className="text-white font-medium hover:underline ml-1 cursor-pointer"
                >
                  Create account
                </button>
              </span>
            ) : (
              <span>
                Already practicing?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(true);
                    setErrorMessage(null);
                  }}
                  className="text-white font-medium hover:underline ml-1 cursor-pointer"
                >
                  Log in
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
