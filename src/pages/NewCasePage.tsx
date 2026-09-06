import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Upload, 
  Check, 
  AlertTriangle, 
  X, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  FileUp, 
  ShieldCheck, 
  HelpCircle,
  FileCheck,
  RefreshCw,
  Clock,
  Layers,
  Building2,
  Scale
} from 'lucide-react';
import { SubjectArea, Jurisdiction, LegalCaseSession, CaseIntakeDraft } from '../types';
import { CASE_TEMPLATES } from '../data/templates';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';

const DRAFT_STORAGE_KEY = 'lexora_case_intake_draft';

const JURISDICTIONS: Jurisdiction[] = [
  'India (Common Law)',
  'United States (Federal/State)',
  'United Kingdom (England & Wales)',
  'European Union',
  'General Common Law Principles',
  'Other'
];

const SUBJECTS: SubjectArea[] = [
  'Contract Law',
  'Constitutional Law',
  'Criminal Law',
  'Tort / Negligence',
  'Property Law',
  'Corporate Law',
  'Administrative Law',
  'Cyber & Intellectual Property Law',
  'Other'
];

type StepMode = 'form' | 'review';
type CreationMethod = 'manual' | 'upload';

interface FormErrors {
  title?: string;
  jurisdiction?: string;
  subject?: string;
  facts?: string;
}

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();

  // Step Mode: 'form' | 'review'
  const [stepMode, setStepMode] = useState<StepMode>('form');

  // Creation Method: 'manual' | 'upload'
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('manual');

  // Form Fields
  const [title, setTitle] = useState('');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('India (Common Law)');
  const [subject, setSubject] = useState<SubjectArea>('Contract Law');
  const [facts, setFacts] = useState('');
  const [issue, setIssue] = useState('');
  const [studentPosition, setStudentPosition] = useState('');
  const [opposingPosition, setOpposingPosition] = useState('');

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'reading' | 'extracting' | 'preparing' | 'extracted' | 'error'>('idle');
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isExtractedFromAi, setIsExtractedFromAi] = useState(false);

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // AI Helper states
  const [isImprovingStructure, setIsImprovingStructure] = useState(false);
  const [isSuggestingIssue, setIsSuggestingIssue] = useState(false);

  // Sample overwrite modal
  const [pendingSample, setPendingSample] = useState<'contract' | 'constitutional' | null>(null);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Draft restoration banner
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Check for saved draft on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft: CaseIntakeDraft = JSON.parse(saved);
        if (draft.title || draft.facts) {
          setTitle(draft.title || '');
          if (draft.jurisdiction) setJurisdiction(draft.jurisdiction);
          if (draft.subject) setSubject(draft.subject);
          setFacts(draft.facts || '');
          setIssue(draft.issue || '');
          setStudentPosition(draft.studentPosition || '');
          setOpposingPosition(draft.opposingPosition || '');
          if (draft.creationMethod) setCreationMethod(draft.creationMethod);
          setShowDraftBanner(true);
        }
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }, []);

  // Autosave draft locally whenever fields change
  useEffect(() => {
    const draft: CaseIntakeDraft = {
      title,
      jurisdiction,
      subject,
      facts,
      issue,
      studentPosition,
      opposingPosition,
      creationMethod,
      uploadedFileName: uploadedFile?.name,
      uploadedFileSize: uploadedFile ? `${Math.round(uploadedFile.size / 1024)} KB` : undefined,
      lastSaved: new Date().toISOString()
    };

    // Save only if user entered something
    if (title || facts || issue || studentPosition || opposingPosition) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.error('Error autosaving draft', e);
      }
    }
  }, [title, jurisdiction, subject, facts, issue, studentPosition, opposingPosition, creationMethod, uploadedFile]);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};
    if (touched.title && !title.trim()) {
      newErrors.title = 'Case title is required.';
    }
    if (touched.jurisdiction && !jurisdiction) {
      newErrors.jurisdiction = 'Select a legal jurisdiction.';
    }
    if (touched.subject && !subject) {
      newErrors.subject = 'Select a legal subject.';
    }
    if (touched.facts && !facts.trim()) {
      newErrors.facts = 'Add the material case facts before continuing.';
    }
    setErrors(newErrors);
  }, [title, jurisdiction, subject, facts, touched]);

  const markAllTouched = () => {
    setTouched({
      title: true,
      jurisdiction: true,
      subject: true,
      facts: true
    });
  };

  const validateForm = (): boolean => {
    markAllTouched();
    const valid = Boolean(title.trim() && jurisdiction && subject && facts.trim());
    if (!valid) {
      const errs: FormErrors = {};
      if (!title.trim()) errs.title = 'Case title is required.';
      if (!jurisdiction) errs.jurisdiction = 'Select a legal jurisdiction.';
      if (!subject) errs.subject = 'Select a legal subject.';
      if (!facts.trim()) errs.facts = 'Add the material case facts before continuing.';
      setErrors(errs);
    }
    return valid;
  };

  // Sample Loaders
  const hasUserEnteredContent = () => {
    return Boolean(title.trim() || facts.trim() || issue.trim() || studentPosition.trim() || opposingPosition.trim());
  };

  const handleRequestSample = (type: 'contract' | 'constitutional') => {
    if (hasUserEnteredContent()) {
      setPendingSample(type);
      setShowOverwriteModal(true);
    } else {
      executeLoadSample(type);
    }
  };

  const executeLoadSample = (type: 'contract' | 'constitutional') => {
    const tmplId = type === 'contract' ? 'contract-email-dispute' : 'constitutional-digital-privacy';
    const tmpl = CASE_TEMPLATES.find(t => t.id === tmplId) || CASE_TEMPLATES[0];

    setTitle(tmpl.title);
    setJurisdiction(tmpl.jurisdiction);
    setSubject(tmpl.subject);
    setFacts(tmpl.facts);
    setIssue(tmpl.issue);
    setStudentPosition(tmpl.studentPosition);
    setOpposingPosition(tmpl.opposingPosition);
    setCreationMethod('manual');
    setIsExtractedFromAi(false);
    setTouched({});
    setErrors({});
    setShowOverwriteModal(false);
    setPendingSample(null);
    showToast(`${type === 'contract' ? 'Contract' : 'Constitutional'} case loaded.`);
  };

  // AI Helper: Improve Structure
  const handleImproveStructure = async () => {
    if (!facts.trim() || isImprovingStructure) return;
    setIsImprovingStructure(true);
    try {
      const structured = await aiService.improveStructure(facts);
      setFacts(structured);
      showToast('Facts restructured chronologically.');
    } catch {
      showToast('Could not restructure facts.');
    } finally {
      setIsImprovingStructure(false);
    }
  };

  // AI Helper: Suggest Issue
  const handleSuggestIssue = async () => {
    if (!facts.trim() || isSuggestingIssue) {
      if (!facts.trim()) {
        setTouched(prev => ({ ...prev, facts: true }));
        setErrors(prev => ({ ...prev, facts: 'Enter facts first to suggest an issue.' }));
      }
      return;
    }
    setIsSuggestingIssue(true);
    try {
      const suggested = await aiService.suggestIssue(facts, subject);
      setIssue(suggested);
      showToast('Legal issue suggested based on facts.');
    } catch {
      showToast('Could not suggest issue.');
    } finally {
      setIsSuggestingIssue(false);
    }
  };

  // File Upload Processing
  const processUploadedFile = async (file: File) => {
    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrorMessage('File exceeds the 10MB maximum limit.');
      setUploadPhase('error');
      return;
    }

    setUploadedFile(file);
    setUploadErrorMessage(null);

    // Progression: Uploading -> Reading -> Extracting -> Preparing -> Extracted
    setUploadPhase('uploading');
    setUploadProgress(20);

    await new Promise(r => setTimeout(r, 450));
    setUploadPhase('reading');
    setUploadProgress(50);

    await new Promise(r => setTimeout(r, 650));
    setUploadPhase('extracting');
    setUploadProgress(80);

    try {
      const extracted = await aiService.extractCaseFromFile(file);

      await new Promise(r => setTimeout(r, 500));
      setUploadPhase('preparing');
      setUploadProgress(100);

      await new Promise(r => setTimeout(r, 400));
      setTitle(extracted.title);
      setJurisdiction(extracted.jurisdiction);
      setSubject(extracted.subject);
      setFacts(extracted.facts);
      setIssue(extracted.issue);
      setStudentPosition(extracted.studentPosition);
      setOpposingPosition(extracted.opposingPosition);
      setIsExtractedFromAi(true);
      setUploadPhase('extracted');
      showToast('Case details extracted successfully.');
    } catch (err: any) {
      setUploadPhase('error');
      setUploadErrorMessage(err?.message || "We couldn't reliably extract the case details from this file.");
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    setUploadPhase('idle');
    setUploadProgress(0);
    setUploadErrorMessage(null);
    setIsExtractedFromAi(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Review Case Button Action
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStepMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create Case & Open Workspace
  const handleCreateWorkspace = () => {
    if (!validateForm()) {
      setStepMode('form');
      return;
    }

    const newId = `sess-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const legalContext = jurisdiction.includes('India')
      ? 'India'
      : jurisdiction.includes('United States')
      ? 'United States'
      : 'General';

    const newSession: LegalCaseSession = {
      id: newId,
      title: title.trim(),
      caseFacts: facts.trim(),
      legalIssue: issue.trim() || 'What is the primary legal question to be determined under these facts?',
      subject,
      jurisdiction,
      legalContext,
      mode: 'argument',
      studentPosition: studentPosition.trim() || 'Petitioner / Moving Party',
      opposingPosition: opposingPosition.trim() || undefined,
      sourceType: creationMethod,
      sourceFileName: uploadedFile?.name,
      status: 'active',
      messages: [],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Persist session to local storage
    storageService.saveSession(newSession);

    // Clear intake draft
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }

    // Navigate to workspace with auto-generating trigger
    navigate(`/workspace?session=${newId}&generating=true`);
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setTitle('');
    setJurisdiction('India (Common Law)');
    setSubject('Contract Law');
    setFacts('');
    setIssue('');
    setStudentPosition('');
    setOpposingPosition('');
    setUploadedFile(null);
    setUploadPhase('idle');
    setIsExtractedFromAi(false);
    setShowDraftBanner(false);
    setTouched({});
    setErrors({});
    showToast('Draft cleared.');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#0F172A] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overwrite Confirmation Modal */}
      {showOverwriteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Replace current draft?</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Loading this sample will replace your current case information with the selected hypothetical problem.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowOverwriteModal(false);
                  setPendingSample(null);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingSample) executeLoadSample(pendingSample);
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Load Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Back to Dashboard */}
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Center Brand */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-900">Lexora</span>
            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
              Case Intake
            </span>
          </div>

          {/* Right: Sample Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRequestSample('contract')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
              title="Populate form with AeroTech commercial contract dispute"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Contract Sample</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestSample('constitutional')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
              title="Populate form with digital privacy surveillance dispute"
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Constitutional Sample</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Draft Restored Notification Banner */}
      {showDraftBanner && (
        <div className="bg-blue-50/90 border-b border-blue-200/80 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-blue-900 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Draft restored:</strong> We recovered your recent uncompleted case draft.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowDraftBanner(false)}
                className="font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Continue Draft
              </button>
              <span className="text-blue-300">|</span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-slate-600 hover:text-red-600 cursor-pointer"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        
        {/* Main Heading & Subtitle */}
        <div className="space-y-1.5 border-b border-slate-200/80 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Formulate New Case
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Build a hypothetical case to generate structured arguments, counter-arguments, and practice material.
              </p>
            </div>

            {/* Mobile Sample Buttons */}
            <div className="flex sm:hidden items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleRequestSample('contract')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                Contract Sample
              </button>
              <button
                type="button"
                onClick={() => handleRequestSample('constitutional')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                Constitutional Sample
              </button>
            </div>
          </div>
        </div>

        {/* REVIEW SCREEN MODE */}
        {stepMode === 'review' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-600 font-bold tracking-wider">
                  STEP 2 OF 2 &bull; VERIFICATION
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Review Case Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStepMode('form')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Case</span>
              </button>
            </div>

            {/* Structured Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Case Basics */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    CASE SUMMARY
                  </span>
                  {isExtractedFromAi && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      AI-extracted
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block">Case Title</label>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Jurisdiction</label>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">{jurisdiction}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block">Legal Subject</label>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">{subject}</p>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{uploadedFile.name}</span>
                  </div>
                )}
              </div>

              {/* Card 2: Legal Issue & Positions */}
              <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    LEGAL ISSUE &amp; POSITIONS
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block">Core Legal Question</label>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 leading-relaxed">
                    "{issue || 'Whether the factual circumstances give rise to actionable liability under governing legal principles.'}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                      Student / Client Position
                    </label>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {studentPosition || 'Petitioner / Moving Party seeking legal relief.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                      Opposing Party Content
                    </label>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {opposingPosition || 'Respondent / Defense asserting lack of breach or valid justification.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Material Facts (Full width) */}
              <div className="md:col-span-3 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    FACT PATTERN (MATERIAL FACTS)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{facts.length} characters</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {facts}
                </p>
              </div>

            </div>

            {/* Educational Disclaimer Pill */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Educational Practice Only:</strong> Generated IRAC reasoning and counter-arguments are tailored for moot rehearsal. Lexora does not provide formal legal counsel or verified citations.
              </span>
            </div>

            {/* Bottom Review Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStepMode('form')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Case</span>
              </button>

              <button
                type="button"
                onClick={handleCreateWorkspace}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer hover:scale-101"
              >
                <span>Create Practice Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* FORM INTAKE MODE */
          <form onSubmit={handleProceedToReview} className="space-y-8 animate-in fade-in duration-300">
            
            {/* Case Creation Method Selector (Segmented Tabs) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCreationMethod('manual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    creationMethod === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${creationMethod === 'manual' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>Build Manually</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMethod('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    creationMethod === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className={`w-3.5 h-3.5 ${creationMethod === 'upload' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>Upload Case File</span>
                </button>
              </div>

              {isExtractedFromAi && (
                <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Showing AI-extracted information from file</span>
                  <button
                    type="button"
                    onClick={handleRemoveUploadedFile}
                    className="ml-2 text-slate-400 hover:text-red-600"
                    title="Clear extracted file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* CONDITIONAL RENDERING BASED ON METHOD */}
            {creationMethod === 'upload' && uploadPhase !== 'extracted' ? (
              
              /* ================= UPLOAD CASE FILE INTERFACE ================= */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">Import a Case File</h2>
                  <p className="text-xs text-slate-600">
                    Upload a hypothetical case document and we'll extract the information needed to build your practice workspace.
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                {uploadPhase === 'idle' || uploadPhase === 'error' ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        Drag &amp; drop your case file here
                      </p>
                      <p className="text-xs text-slate-500">
                        or <span className="text-blue-600 font-semibold underline underline-offset-2">Browse Files</span> from your device
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">PDF</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">DOCX</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">TXT</span>
                      <span className="text-[10px] text-slate-400 ml-1">Up to 10MB</span>
                    </div>

                    <div className="pt-3 text-[11px] text-slate-400">
                      Files are processed for educational practice only.
                    </div>
                  </div>
                ) : (
                  /* Processing Sequence States */
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        {uploadPhase === 'uploading' && 'State 01: Uploading document...'}
                        {uploadPhase === 'reading' && 'State 02: Reading document...'}
                        {uploadPhase === 'extracting' && 'State 03: Extracting case information...'}
                        {uploadPhase === 'preparing' && 'State 04: Preparing case draft...'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Analyzing case facts, jurisdiction context, and legal issues.
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mx-auto bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Error & Fallback */}
                {uploadPhase === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-semibold text-red-900">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>{uploadErrorMessage || "We couldn't reliably extract the case details from this file."}</span>
                    </div>
                    <p className="text-red-700">
                      You can retry uploading another document or switch to manual input without losing your work.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadPhase('idle');
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreationMethod('manual');
                          setUploadPhase('idle');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-900 font-medium text-xs hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Enter Manually
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* ================= MANUAL FORM OR EXTRACTED REVIEW FORM ================= */
              <div className="space-y-6">
                
                {/* Extracted Review Notice Bar (if file was extracted) */}
                {isExtractedFromAi && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <strong className="text-blue-900 font-bold block">Review Your Case (AI-Extracted)</strong>
                        <span className="text-blue-800">
                          Verify or adjust the extracted details below before proceeding.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-900 hover:bg-blue-100 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedFile}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= SECTION 01 — CASE BASICS ================= */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">
                        01
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Case Basics
                      </h2>
                    </div>
                    {isExtractedFromAi && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold">
                        AI-extracted
                      </span>
                    )}
                  </div>

                  {/* Case Title */}
                  <div className="space-y-1">
                    <label htmlFor="caseTitle" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Case Title / Dispute Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="caseTitle"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                      placeholder="e.g., Solaris Corp. v. Matrix Global Logistics"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        errors.title
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* Two Column: Jurisdiction & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    
                    {/* Target Legal Jurisdiction */}
                    <div className="space-y-1">
                      <label htmlFor="jurisdiction" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>Target Legal Jurisdiction</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="jurisdiction"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                        onBlur={() => setTouched(prev => ({ ...prev, jurisdiction: true }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-colors cursor-pointer"
                      >
                        {JURISDICTIONS.map((j) => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                      {errors.jurisdiction && (
                        <p className="text-[11px] text-red-600 font-medium">{errors.jurisdiction}</p>
                      )}
                    </div>

                    {/* Legal Subject / Field */}
                    <div className="space-y-1">
                      <label htmlFor="subject" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>Legal Subject / Field</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value as SubjectArea)}
                        onBlur={() => setTouched(prev => ({ ...prev, subject: true }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-colors cursor-pointer"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="text-[11px] text-red-600 font-medium">{errors.subject}</p>
                      )}
                    </div>

                  </div>
                </section>

                {/* ================= SECTION 02 — MATERIAL FACTS ================= */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">
                        02
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                          <span>Material Case Facts</span>
                          <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Describe the relevant events, chronology, agreements, actions, disputes, or governmental orders.
                        </p>
                      </div>
                    </div>

                    {/* Optional Helper: Improve Structure */}
                    <button
                      type="button"
                      onClick={handleImproveStructure}
                      disabled={isImprovingStructure || !facts.trim()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer self-start sm:self-auto ${
                        facts.trim() && !isImprovingStructure
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                      title="Organize your existing text chronologically without inventing facts"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isImprovingStructure ? 'Structuring…' : 'Improve Structure'}</span>
                    </button>
                  </div>

                  {/* Large Textarea */}
                  <div className="space-y-1">
                    <textarea
                      id="materialFacts"
                      rows={8}
                      value={facts}
                      onChange={(e) => setFacts(e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, facts: true }))}
                      placeholder="State the material factual sequence of events..."
                      className={`w-full p-4 rounded-xl border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-y min-h-[180px] leading-relaxed transition-colors ${
                        errors.facts
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10'
                      }`}
                    />

                    {/* Character Counter & Inline Validation */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        {errors.facts && (
                          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{errors.facts}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {facts.length} / 5000
                      </span>
                    </div>
                  </div>
                </section>

                {/* ================= SECTION 03 — LEGAL ISSUE ================= */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">
                        03
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Core Legal Question / Issue
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          State the central legal question the case should examine. (Optional)
                        </p>
                      </div>
                    </div>

                    {/* Subtle AI Assistance: Suggest Issue */}
                    <button
                      type="button"
                      onClick={handleSuggestIssue}
                      disabled={isSuggestingIssue || !facts.trim()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer self-start sm:self-auto ${
                        facts.trim() && !isSuggestingIssue
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                      title="Analyze facts to suggest a moot court legal question"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSuggestingIssue ? 'Analyzing facts…' : 'Suggest Issue'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="e.g., Whether the contractual termination clause is enforceable under the selected jurisdiction."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  />
                </section>

                {/* ================= SECTION 04 — POSITIONS ================= */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">
                        04
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Moot Court Positions (FOR / AGAINST)
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select your stance. The AI opponent will automatically argue from the opposite side.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Position Selector Segmented Control */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Choose Your Position:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStudentPosition('FOR');
                          setOpposingPosition('AGAINST');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          studentPosition.toUpperCase().startsWith('FOR')
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-700">FOR — Support Claim</span>
                          {studentPosition.toUpperCase().startsWith('FOR') && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          You argue in favor of the petitioner/moving claim.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudentPosition('AGAINST');
                          setOpposingPosition('FOR');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          studentPosition.toUpperCase().startsWith('AGAINST')
                            ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-700">AGAINST — Oppose Claim</span>
                          {studentPosition.toUpperCase().startsWith('AGAINST') && (
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          You argue in defense or against the asserted claim.
                        </p>
                      </button>
                    </div>

                    {/* AI Opposite Display Card */}
                    <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">AI Opposing Counsel Side:</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white">
                          {studentPosition.toUpperCase().startsWith('FOR') ? 'AGAINST' : 'FOR'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        Automatically determined (Opposite Side)
                      </span>
                    </div>
                  </div>

                  {/* Two-Column Detail Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {/* Student / Client Position */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Student Opening Argument Notes
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Optional opening argument points or legal theories.
                      </p>
                      <textarea
                        rows={3}
                        value={studentPosition}
                        onChange={(e) => {
                          setStudentPosition(e.target.value);
                          if (e.target.value.toUpperCase().startsWith('FOR')) {
                            setOpposingPosition('AGAINST');
                          } else if (e.target.value.toUpperCase().startsWith('AGAINST')) {
                            setOpposingPosition('FOR');
                          }
                        }}
                        placeholder="e.g., FOR — We argue that valid acceptance was communicated electronically."
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-colors resize-y"
                      />
                    </div>

                    {/* Opposing Party Content */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Opposing Counsel Defense
                      </label>
                      <p className="text-[11px] text-slate-500">
                        The counter-theory the AI will develop.
                      </p>
                      <textarea
                        rows={3}
                        value={opposingPosition}
                        onChange={(e) => setOpposingPosition(e.target.value)}
                        placeholder="e.g., AGAINST — Automated receipt lacks human consensus ad idem."
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-colors resize-y"
                      />
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* Legal Safety Notice */}
            <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-800">Educational Practice Sandbox:</strong> Lexora strictly enforces verified general legal doctrines and avoids invented court citations. This material does not constitute professional legal counsel.
              </p>
            </div>

            {/* Primary CTA Bottom Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer hover:scale-101"
              >
                <span>Review Case</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </main>

      {/* Minimal Academic Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Lexora Legal AI &bull; Moot Court &amp; Legal Reasoning Practice &bull; Educational Use Only
      </footer>

    </div>
  );
};
export default NewCasePage;
