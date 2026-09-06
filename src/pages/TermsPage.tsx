import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            LEGAL NOTICE &amp; EDUCATIONAL USE TERMS
          </span>
          <h1 className="text-3xl font-extrabold text-white">Terms of Educational Use</h1>
          <p className="text-xs text-zinc-400">Last updated: September 2026</p>
        </div>

        {/* Primary Educational Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>CRITICAL EDUCATIONAL DISCLAIMER</span>
          </div>
          <p className="leading-relaxed">
            Lexora is strictly an academic sandbox and educational simulation designed to assist law students, moot court competitors, and legal academics in argument structure, rebuttal framing, and plain-language summarization. Lexora does not provide legal advice, does not practice law in any jurisdiction, does not form an attorney-client relationship, and must never be relied upon for real pending legal disputes.
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Nature of the Service</h2>
            <p>
              Lexora utilizes generative machine-intelligence models to process hypothetical case facts and formulate arguments following the standard IRAC (Issue, Rule, Application, Conclusion) framework. All generated principles reflect general jurisprudence rather than specific, verified statutory or case law citations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. No Fabrication of Authorities</h2>
            <p>
              In accordance with core responsible AI design principles, Lexora explicitly avoids inventing fictitious case citations, judges, or statutes. Users are strictly required to verify all legal rules against primary sources before incorporating them into formal academic submissions or moot memorials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. User Responsibility &amp; Confidentiality</h2>
            <p>
              Users must not input confidential client data, classified documents, or non-public sensitive information into the Lexora sandbox. The platform is intended solely for public hypothetical exercises, academic moot court problem sets, and educational instruction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Limitation of Liability</h2>
            <p>
              Under no circumstances shall the creators, developers, or contributors of Lexora be liable for any legal outcomes, academic grading penalties, or damages resulting from reliance on material generated through this educational simulation.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-zinc-800 text-center text-xs text-zinc-400">
          Lexora AI Moot Court Assistant &bull; Designed for Responsible Legal Education
        </div>

      </div>
    </div>
  );
};
