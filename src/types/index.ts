export type SubjectArea = 
  | 'Contract Law' 
  | 'Criminal Law' 
  | 'Constitutional Law' 
  | 'Tort Law'
  | 'Tort / Negligence'
  | 'Property Law'
  | 'Corporate Law'
  | 'Administrative Law'
  | 'Cyber & Intellectual Property Law'
  | 'Other';

export type Jurisdiction = 
  | 'India (Common Law)'
  | 'United States (Federal/State)'
  | 'United Kingdom (England & Wales)'
  | 'European Union'
  | 'General Common Law Principles'
  | 'Other';

export type LegalContext = 'India' | 'United States' | 'General';

export type PracticeMode = 'argument' | 'counter' | 'explain' | 'debate';

export interface LegalPrinciple {
  doctrineName: string;
  statement: string;
  sourceType: 'General Doctrine' | 'Standard Common Law Rule' | 'Statutory Principle';
  verificationNotice: string;
}

export interface IRACArgument {
  issue: string;
  rule: {
    principles: LegalPrinciple[];
    generalFramework: string;
  };
  application: {
    studentStrengths: string[];
    factualPointsApplied: string[];
    synthesis: string;
  };
  conclusion: {
    primaryFinding: string;
    practicalAdviceForMoot: string;
  };
}

export interface CounterArgumentData {
  oppositionCoreTheory: string;
  ruleVulnerabilities: string[];
  alternativeFactualInterpretations: string[];
  strongestOpposingConclusions: string;
  suggestedRebuttalTactics: string[];
}

export interface KeyTermDefinition {
  term: string;
  plainMeaning: string;
  contextInCase: string;
}

export interface PlainLanguageData {
  inSimpleTerms: string;
  keyTerms: KeyTermDefinition[];
  whyItMatters: string;
  originalDenseComparison: {
    originalProse: string;
    simplifiedProse: string;
  };
}

export interface StrengthScore {
  overallScore: number; // 0 - 100
  breakdown: {
    structureScore: number;
    legalReasoningScore: number;
    factApplicationScore: number;
    counterArgumentReadinessScore: number;
  };
  feedbackSuggestions: string[];
  disclaimer: string;
}

export interface DebateMessage {
  id: string;
  roundNumber: number;
  speaker: 'student' | 'opposition';
  text: string;
  timestamp: string;
  isVoiceInput?: boolean;
}

export interface DebateSession {
  currentRound: number;
  totalRounds: number;
  messages: DebateMessage[];
  status: 'idle' | 'in_progress' | 'completed';
  verdictFeedback?: {
    persuasionScore: number;
    oralAdvocacyNotes: string[];
    strongestArgument?: string;
    weakestPoint?: string;
    suggestedImprovement?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: PracticeMode;
  timestamp: string;
  iracData?: IRACArgument;
  counterData?: CounterArgumentData;
  plainData?: PlainLanguageData;
  strengthScore?: StrengthScore;
  attachmentName?: string;
}

export interface CaseAttachment {
  name: string;
  size: string;
  content?: string;
}

export interface LegalCaseSession {
  id: string;
  title: string;
  caseFacts: string;
  legalIssue: string;
  subject: SubjectArea;
  jurisdiction: Jurisdiction;
  legalContext: LegalContext;
  mode: PracticeMode;
  studentPosition: string;
  opposingPosition?: string;
  sourceType?: 'manual' | 'upload';
  sourceFileName?: string;
  status?: 'draft' | 'active' | 'archived';
  attachment?: CaseAttachment;
  attachedNotes?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  iracArgument?: IRACArgument;
  counterArgument?: CounterArgumentData;
  plainLanguage?: PlainLanguageData;
  strengthScore?: StrengthScore;
  debateSession?: DebateSession;
}

export interface CaseTemplate {
  id: string;
  name: string;
  subject: SubjectArea;
  jurisdiction: Jurisdiction;
  legalContext: LegalContext;
  title: string;
  facts: string;
  issue: string;
  studentPosition: string;
  opposingPosition: string;
  description: string;
}

export interface CaseIntakeDraft {
  title: string;
  jurisdiction: Jurisdiction;
  subject: SubjectArea;
  facts: string;
  issue: string;
  studentPosition: string;
  opposingPosition: string;
  creationMethod: 'manual' | 'upload';
  uploadedFileName?: string;
  uploadedFileSize?: string;
  lastSaved?: string;
}

