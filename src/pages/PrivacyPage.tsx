import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Lexora</span>
        </Link>

        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider font-semibold">
            PRIVACY &amp; STUDENT DATA GOVERNANCE
          </span>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-zinc-400">Last updated: September 2026</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local-First Sandbox Architecture</span>
          </div>
          <p className="leading-relaxed">
            Lexora prioritizes student privacy. Case briefs, voice transcriptions, and debate histories in this educational sandbox are preserved locally in your browser storage (`localStorage`) and are never sold or utilized for training third-party advertising algorithms.
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              In this preview demonstration, Lexora collects your practice profile details (name, email) and hypothetical case facts submitted for IRAC argument structuring. Voice inputs recorded via the Web Speech API are transcribed live inside your client browser.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Speech &amp; Audio Processing</h2>
            <p>
              Voice advocacy practice relies on the native browser Web Speech API. Audio signals are converted to text streams for oral argument simulation and are not archived on external recording servers by Lexora.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Data Retention &amp; Local Storage</h2>
            <p>
              Session history records reside in your local browser environment. You may purge saved practice sessions at any time using the delete controls located on the History page.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-zinc-800 text-center text-xs text-zinc-400">
          Lexora AI Moot Court Assistant &bull; Student Privacy Standards
        </div>

      </div>
    </div>
  );
};
