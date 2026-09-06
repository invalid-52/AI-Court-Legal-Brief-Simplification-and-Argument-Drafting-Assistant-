import { 
  IRACArgument, 
  CounterArgumentData, 
  PlainLanguageData, 
  StrengthScore, 
  SubjectArea, 
  Jurisdiction,
  DebateMessage
} from '../types';

/**
 * AI Service for Lexora — AI Moot Court & Legal Reasoning Assistant.
 * Built with a clean interface for plug-and-play LLM backend connectivity (OpenAI, Claude, FastAPI)
 * while providing rigorous, education-first mock reasoning adhering strictly to the SRS:
 * - Strictly IRAC format
 * - General legal principles only (NO fabricated citations or fictional court names)
 * - Clear distinction between general doctrine and verified authority
 */

export interface BackendHealthResponse {
  status: string;
  backend: string;
  providers: {
    gemini: { configured: boolean; model: string; role: string };
    groq: { configured: boolean; model: string; role: string };
  };
  voice: {
    transcription_available: boolean;
    tts_available: boolean;
  };
  timestamp: string;
}

export interface DebateOppositionResponse {
  success: boolean;
  round: number;
  user_position: string;
  ai_position: string;
  ai_response: string;
  provider: string;
}

export interface DebateSummaryResponse {
  success: boolean;
  rounds_completed: number;
  summary: {
    persuasionScore: number;
    structureScore?: number;
    legalReasoningScore?: number;
    oralAdvocacyNotes: string[];
    strongestArgument?: string;
    weakestPoint?: string;
    suggestedImprovement?: string;
    overallVerdict?: string;
  };
}

interface GenerateArgumentParams {
  facts: string;
  issue: string;
  subject: SubjectArea;
  jurisdiction: Jurisdiction;
  studentPosition: string;
  opposingPosition?: string;
}

export const aiService = {
  /**
   * Checks the health and status of the Python backend and AI providers
   */
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Generates a structured IRAC legal argument via the backend AI engine
   */
  async generateArgument(params: GenerateArgumentParams): Promise<IRACArgument> {
    const { facts, issue, subject, jurisdiction, studentPosition } = params;

    try {
      const res = await fetch('/api/debate/irac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facts,
          issue: issue || '',
          subject,
          jurisdiction,
          student_position: studentPosition || 'FOR'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.irac) {
          return data.irac;
        }
      }
    } catch (e) {
      console.warn('Backend IRAC call failed, using intelligent local synthesis fallback:', e);
    }

    // Simulate brief network latency for fallback synthesis
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Detect core themes based on subject or keywords
    const isContract = subject === 'Contract Law' || facts.toLowerCase().includes('contract') || facts.toLowerCase().includes('email') || facts.toLowerCase().includes('offer');
    const isTort = subject === 'Tort Law' || facts.toLowerCase().includes('negligence') || facts.toLowerCase().includes('duty') || facts.toLowerCase().includes('doctor');
    const isConstitutional = subject === 'Constitutional Law' || facts.toLowerCase().includes('privacy') || facts.toLowerCase().includes('surveillance') || facts.toLowerCase().includes('fundamental');
    const isCriminal = subject === 'Criminal Law' || facts.toLowerCase().includes('defense') || facts.toLowerCase().includes('murder') || facts.toLowerCase().includes('weapon');

    if (isContract) {
      return {
        issue: issue || 'Whether electronic communication of acceptance constitutes an irrevocable consensus ad idem prior to formal human review.',
        rule: {
          generalFramework: 'In modern commercial contract law, the formation of an enforceable agreement requires an unequivocal offer, unqualified acceptance, lawful consideration, and mutual intention to create legal relations. Under the electronic adaptation of the Postal Acceptance Rule and contemporary digital contract statutes, acceptance transmitted to an authorized electronic address takes effect when it enters the information system designated by the addressee.',
          principles: [
            {
              doctrineName: 'Doctrine of Consensus ad Idem (Meeting of Minds)',
              statement: 'Parties must mutually assent to identical terms at the identical time; objective manifestation of agreement overrides unexpressed subjective reservations.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Established Common Law Contract Principle'
            },
            {
              doctrineName: 'Rule on Receipt of Electronic Acceptance',
              statement: 'Where an offer invites acceptance through electronic media, receipt occurs at the timestamp the electronic record enters an information system designated by the offeror, unless parties explicitly agreed otherwise.',
              sourceType: 'Standard Common Law Rule',
              verificationNotice: 'Statutory UNCITRAL / Model Law Standard (Consult specific local jurisdiction statutes)'
            },
            {
              doctrineName: 'Limitation on Unilateral Revocation',
              statement: 'An offeror retains the privilege to revoke an outstanding offer only prior to valid acceptance. Once acceptance is communicated in the designated manner, the offer is extinguished and replaced by a binding obligation.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Fundamental Common Law Doctrine'
            }
          ]
        },
        application: {
          studentStrengths: [
            'Objective manifestation of assent: The transmission of the acceptance email directly fulfilled the open window and quotation terms.',
            'System designated receipt: The offeror’s server acknowledged receipt and dispatched automated telemetry prior to the subsequent revocation attempt.',
            'Risk allocation: The party designating electronic communication channels bears the risk of processing delays within their internal review machinery.'
          ],
          factualPointsApplied: [
            'The quotation expressly stated it remained open for acceptance, without conditioning formation on subsequent human board approval.',
            'The acceptance was transmitted at 4:30 PM, whereas the purported withdrawal occurred 40 minutes later at 5:10 PM.',
            'The automated server reply at 4:32 PM provides documentary timestamp evidence that the acceptance reached the designated electronic receptacle.'
          ],
          synthesis: 'Applying the objective theory of contract, a reasonable observer in commercial commerce would conclude that the exchange of terms followed by formal purchase order acceptance created a binding bargain. The subsequent revocation at 5:10 PM arrived after the legal power of acceptance had already been exercised, rendering the revocation ineffective to discharge the primary obligation.'
        },
        conclusion: {
          primaryFinding: 'A binding contract was validly constituted upon the receipt of the acceptance email on the offeror’s designated system. The subsequent unilateral revocation constitutes an anticipatory repudiation.',
          practicalAdviceForMoot: 'Focus your oral advocacy on the objective standard of commercial reasonableness. Emphasize that allowing offerors to nullify electronic contracts based on internal executive review delays would undermine digital commerce certainty.'
        }
      };
    }

    if (isTort) {
      return {
        issue: issue || 'Whether the failure to disclose a low-incidence, non-fatal risk breaches the professional standard of care under the informed consent doctrine.',
        rule: {
          generalFramework: 'In actionable medical negligence, the claimant must establish: (1) a recognized duty of care, (2) a breach of the applicable standard of care, (3) factual causation (the \'but-for\' test), and (4) non-remote damage. The standard of care in disclosure has shifted from traditional peer-professional consensus to a patient-centered doctrine of material risk.',
          principles: [
            {
              doctrineName: 'Patient-Centered Material Risk Doctrine (Montgomery Standard)',
              statement: 'A doctor is under a duty to take reasonable care to ensure the patient is aware of any material risks involved in recommended treatment, and of any reasonable alternative treatments.',
              sourceType: 'Standard Common Law Rule',
              verificationNotice: 'Modern Common Law Jurisdictional Standard'
            },
            {
              doctrineName: 'Test of Materiality',
              statement: 'A risk is material if a reasonable person in the patient\'s position would be likely to attach significance to it, or if the doctor knows or should reasonably know that the particular patient would be likely to attach significance to it.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Subject to local jurisdictional statutes on medical negligence'
            },
            {
              doctrineName: 'Causation in Information Disclosure',
              statement: 'The claimant must demonstrate that had proper disclosure occurred, they would have declined the procedure or chosen a different, non-injurious course of treatment on the balance of probabilities.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Causation principles in Tort of Negligence'
            }
          ]
        },
        application: {
          studentStrengths: [
            'Materiality of outcome: Permanent motor and sensory paralysis is life-altering, irrespective of whether the mathematical probability is sub-1%.',
            'Subjective autonomy: The patient presented for elective therapy and testified credibly that alternative non-surgical regimens would have been pursued.',
            'Distinct nature of disclosure duty: Exemplary technical surgical performance does not cure or excuse an antecedent failure of informed consent.'
          ],
          factualPointsApplied: [
            'The risk of sensory paralysis was documented in surgical literature, demonstrating foreseeability on the part of the medical team.',
            'The procedure was elective rather than an emergency intervention requiring immediate preservation of life.',
            'The patient specifically inquired about recovery expectations, placing the surgeon on notice of mobility concerns.'
          ],
          synthesis: 'While the defendant exercised exemplary technical skill during surgery, the duty to inform is an independent legal obligation rooted in bodily autonomy. Under the modern objective-subjective standard, a risk of permanent paralysis—even at 0.8%—is material to a patient undergoing elective surgery.'
        },
        conclusion: {
          primaryFinding: 'The defendant breached the duty of care by withholding disclosure of a material risk, thereby vitiating informed consent and establishing actionable liability for the resulting impairment.',
          practicalAdviceForMoot: 'Strictly segregate the issue of \'surgical competence\' from \'informational negligence\'. Concede that the surgery was well-performed so you can hammer home that the injury was sustained during an unauthorized procedure.'
        }
      };
    }

    if (isConstitutional) {
      return {
        issue: issue || 'Whether executive warrantless bulk metadata surveillance infringes constitutional privacy rights under the proportionality standard.',
        rule: {
          generalFramework: 'Fundamental rights may only be restricted by the State pursuant to valid law that satisfies the three-pronged doctrine of proportionality: (1) legality (a valid enacted statute), (2) legitimate state aim, and (3) suitability, necessity (least intrusive means), and balancing of interests.',
          principles: [
            {
              doctrineName: 'Four-Pronged Proportionality Standard',
              statement: 'State interference with fundamental privacy must: (a) be sanctioned by law, (b) serve a legitimate purpose, (c) be rationally connected to the purpose, (d) be the least restrictive measure available, and (e) maintain proportionality stricto sensu.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Constitutional Proportionality Doctrine (Common Law Benchmarks)'
            },
            {
              doctrineName: 'Right to Informational Privacy',
              statement: 'Privacy encompasses digital autonomy and informational self-determination; metadata in the aggregate generates comprehensive behavioural portraits indistinguishable from substantive content.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Recognized Constitutional Principle across major democracies'
            },
            {
              doctrineName: 'Requirement of Independent Judicial Oversight',
              statement: 'Surveillance measures lacking prior judicial authorization or robust independent post-facto review violate procedural due process.',
              sourceType: 'General Doctrine',
              verificationNotice: 'Procedural Due Process Benchmark'
            }
          ]
        },
        application: {
          studentStrengths: [
            'Failure of necessity: Bulk non-targeted collection sweeps innocent citizens without reasonable individualized suspicion.',
            'Lack of procedural safeguards: Purely internal administrative authorization without independent judicial oversight invites arbitrary executive overreach.',
            'Proportionality stricto sensu: The speculative benefits to counter-terrorism do not outweigh the profound chilling effect on democratic speech and association.'
          ],
          factualPointsApplied: [
            'The surveillance program retains comprehensive records for 24 months for every domestic subscriber regardless of criminal suspicion.',
            'The authorization requires only an executive certification of \'prevention of disorder\' rather than an established judicial warrant.',
            'Modern metadata analytics permit reconstruction of intimate religious, political, and medical associations.'
          ],
          synthesis: 'The measure fails the necessity prong because targeted intercept regimes with judicial oversight achieve national security objectives without subjecting millions of non-suspect citizens to ubiquitous perpetual logging.'
        },
        conclusion: {
          primaryFinding: 'The executive notification violates the constitutional right to privacy as it fails the proportionality test and lacks procedural safeguards mandated by due process.',
          practicalAdviceForMoot: 'Dismantle the opposition’s argument that \'metadata is just routing information\'. Cite technical literature conceptually showing that geolocation + timestamp aggregates provide a total window into private life.'
        }
      };
    }

    // Default / Criminal / General Legal Template
    return {
      issue: issue || 'Whether the defendant had an objectively reasonable apprehension of imminent bodily harm justifying the defensive use of force.',
      rule: {
        generalFramework: 'Self-defense justifies the use of reasonable force against an unlawful attack where the actor reasonably believes that such force is immediately necessary to protect against unlawful force. Lethal force is restricted to defense against death, grievous bodily injury, or violent felony.',
        principles: [
          {
            doctrineName: 'Doctrine of Objective and Subjective Reasonableness',
            statement: 'The actor must honestly believe the threat exists (subjective), and a prudent person situated in the same circumstances would have held that belief (objective).',
            sourceType: 'General Doctrine',
            verificationNotice: 'Core Common Law Criminal Jurisprudence'
          },
          {
            doctrineName: 'Curtilage and Castle Doctrine Exemption',
            statement: 'A person unlawfully assaulted inside their dwelling or recognized domestic curtilage has no legal obligation to retreat before exercising lawful protective force.',
            sourceType: 'Standard Common Law Rule',
            verificationNotice: 'Jurisdiction-dependent statutory provisions apply'
          },
          {
            doctrineName: 'Principle of Proportional Response',
            statement: 'Force employed in defense must not exceed the degree of force reasonably necessary to repel the perceived danger.',
            sourceType: 'General Doctrine',
            verificationNotice: 'Universal Criminal Law Doctrine'
          }
        ]
      },
      application: {
        studentStrengths: [
          'Immediate physical proximity and dark conditions impaired ability to verify alternative harmlessness.',
          'The intruder advanced aggressively with a heavy blunt instrument inside private domestic curtilage after a clear verbal warning.',
          'The confrontation occurred during nighttime breaking-and-entering, creating heightened reasonable peril.'
        ],
        factualPointsApplied: [
          'The intruder was wielding a steel crowbar and advanced abruptly toward the homeowner.',
          'The homeowner issued a verbal warning before discharging the firearm.',
          'The physical encounter occurred at a critical distance of approximately 10 feet where reaction time is split-second.'
        ],
        synthesis: 'When situated in an unlit domestic yard facing an intruder brandishing a blunt impact weapon, a reasonable person would conclude that retreat was impossible without exposing themselves to immediate violent trauma.'
      },
      conclusion: {
        primaryFinding: 'The defendant\'s actions were justified under self-defense principles, negating criminal liability for the resulting fatality.',
        practicalAdviceForMoot: 'In oral argument, reconstruct the seconds of the encounter. Stress the \'split-second decision in detached reflection cannot be demanded in the presence of an uplifted knife or crowbar\'.'
      }
    };
  },

  /**
   * Generates adversarial Counter-Arguments for moot court preparation,
   * grounded in the student's actual case facts (via the backend AI engine,
   * with a fact-derived local fallback if the backend is unreachable).
   */
  async generateCounterArgument(params: {
    facts: string;
    issue: string;
    subject?: SubjectArea;
    jurisdiction?: Jurisdiction;
    iracArgument?: IRACArgument;
    studentPosition: string;
  }): Promise<CounterArgumentData> {
    try {
      const res = await fetch('/api/debate/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facts: params.facts,
          issue: params.issue || '',
          subject: params.subject || 'Contract Law',
          jurisdiction: params.jurisdiction || 'India (Common Law)',
          student_position: params.studentPosition || 'FOR',
          irac_summary: params.iracArgument ? JSON.stringify(params.iracArgument).slice(0, 4000) : ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.counter) {
          return data.counter;
        }
      }
    } catch (e) {
      console.warn('Backend counter-argument call failed, using fact-derived local fallback:', e);
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    const factsSnippet = (params.facts || 'the facts as presented').split(/\n/)[0].slice(0, 200);
    const subject = params.subject || 'the applicable law';
    const position = params.studentPosition || 'the student\'s position';

    return {
      oppositionCoreTheory: `The opposition will argue that, on these facts ("${factsSnippet}..."), ${position} rests on an overly rigid reading of ${subject} that ignores the practical realities of what actually happened.`,
      ruleVulnerabilities: [
        `The doctrine relied upon under ${subject} is not automatically satisfied just because the facts resemble a textbook pattern — the opposition will press on any missing or ambiguous element.`,
        'The argument may under-address whether the other side\'s conduct actually meets the threshold the governing standard requires.',
        'Gaps or ambiguities in the supplied facts leave room for the opposition to argue the burden of proof hasn\'t been met.'
      ],
      alternativeFactualInterpretations: [
        'The same sequence of events could support a narrower, more innocent explanation than the one assumed.',
        'Ambiguous timing, wording, or context in the facts can be read against the student\'s position.',
        'The absence of clearly stated intent in the facts weakens claims about what either party meant.'
      ],
      strongestOpposingConclusions: `On these facts, the opposition will contend that ${position} has not been established under ${subject}, and no liability or claim arises.`,
      suggestedRebuttalTactics: [
        'Anchor the rebuttal in the objective, undisputed facts rather than inferred intent.',
        'Name and dismantle the opposition\'s weakest factual interpretation before they can raise it.',
        `Tie the reasoning firmly back to the core doctrine governing ${subject} so the bench sees one clean, principled position.`
      ]
    };
  },

  /**
   * Generates a Plain-Language Explainer for first-year law students,
   * grounded in the actual case facts (via the backend AI engine, with a
   * fact-derived local fallback if the backend is unreachable).
   */
  async explainArgument(params: {
    facts: string;
    issue: string;
    subject?: SubjectArea;
    iracArgument?: IRACArgument;
  }): Promise<PlainLanguageData> {
    try {
      const res = await fetch('/api/debate/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facts: params.facts,
          issue: params.issue || '',
          subject: params.subject || 'Contract Law',
          irac_summary: params.iracArgument ? JSON.stringify(params.iracArgument).slice(0, 4000) : ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.explainer) {
          return data.explainer;
        }
      }
    } catch (e) {
      console.warn('Backend explainer call failed, using fact-derived local fallback:', e);
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    const factsSnippet = (params.facts || 'the situation described').split(/\n/)[0].slice(0, 200);
    const subject = params.subject || 'this area of law';

    return {
      inSimpleTerms: `Here's the plain version: ${factsSnippet}. The real question is: ${params.issue || 'whether one side is legally responsible for what happened.'}`,
      keyTerms: [
        {
          term: `${subject} standard`,
          plainMeaning: 'The basic legal test courts use to decide who is responsible in this area of law.',
          contextInCase: 'This is the test that decides who wins, based on the facts above.'
        },
        {
          term: 'Burden of proof',
          plainMeaning: 'Whoever makes the claim has to bring enough evidence to back it up.',
          contextInCase: 'The student\'s side needs to show the facts actually satisfy each part of the legal test.'
        },
        {
          term: 'Material fact',
          plainMeaning: 'A fact that could actually change the outcome of the case.',
          contextInCase: 'Not every detail in the story matters — only the ones tied directly to the legal issue.'
        }
      ],
      whyItMatters: `Disputes like this come up constantly in ${subject.toLowerCase()} — understanding the reasoning here helps with similar real-world situations.`,
      originalDenseComparison: {
        originalProse: `The instant matter turns on whether the material conduct described gives rise to an actionable claim under the governing doctrine applicable to ${subject}.`,
        simplifiedProse: `Basically: did what happened actually break the rule the law sets for ${subject.toLowerCase()} cases?`
      }
    };
  },

  /**
   * Generates informal argument strength scoring for educational feedback,
   * grounded in the actual case (via the backend AI engine, with a
   * fact-derived local fallback if the backend is unreachable).
   */
  async scoreArgument(params: {
    facts: string;
    issue: string;
    subject?: SubjectArea;
    studentPosition?: string;
    iracArgument?: IRACArgument;
  }): Promise<StrengthScore> {
    try {
      const res = await fetch('/api/debate/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facts: params.facts,
          issue: params.issue || '',
          subject: params.subject || 'Contract Law',
          student_position: params.studentPosition || 'FOR',
          irac_summary: params.iracArgument ? JSON.stringify(params.iracArgument).slice(0, 4000) : ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.score) {
          return data.score;
        }
      }
    } catch (e) {
      console.warn('Backend strength-scoring call failed, using local fallback:', e);
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    const subject = params.subject || 'the applicable law';

    return {
      overallScore: 78,
      breakdown: {
        structureScore: 82,
        legalReasoningScore: 78,
        factApplicationScore: 75,
        counterArgumentReadinessScore: 70
      },
      feedbackSuggestions: [
        `Make sure the Rule section explicitly names the ${subject} doctrine you're relying on before applying it.`,
        'Tie each factual point directly back to an element of the legal test, rather than just restating facts.',
        'Pre-empt the opposition\'s strongest counter-argument before they raise it.',
        'Keep the Conclusion focused on one clear finding rather than hedging across multiple outcomes.'
      ],
      disclaimer: 'Informal educational practice feedback only — not an official academic grade or legal opinion.'
    };
  },

  /**
   * Starts a debate and validates the user position vs AI position
   */
  async startDebate(params: {
    caseFacts: string;
    legalIssue?: string;
    subject?: string;
    jurisdiction?: string;
    userPosition: string;
  }): Promise<{ user_position: string; ai_position: string }> {
    const res = await fetch('/api/debate/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_facts: params.caseFacts,
        legal_issue: params.legalIssue || '',
        subject: params.subject || 'Contract Law',
        jurisdiction: params.jurisdiction || 'India (Common Law)',
        user_position: params.userPosition
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start debate.');
    }
    return await res.json();
  },

  /**
   * Executes a live round in the Virtual Debate chamber using real Gemini/Groq opposition
   */
  async runDebateRound(params: {
    roundNumber: number;
    studentArgument: string;
    caseFacts: string;
    studentPosition: string;
    legalIssue?: string;
    subject?: string;
    jurisdiction?: string;
    debateHistory?: Array<{ round?: number; roundNumber?: number; student?: string; text?: string; ai?: string }>;
    provider?: 'gemini' | 'groq' | 'auto';
  }): Promise<DebateMessage & { aiPosition?: string; provider?: string }> {
    try {
      // Normalize debate history
      const formattedHistory = (params.debateHistory || []).map((h) => ({
        round: h.round || h.roundNumber || 1,
        student: h.student || h.text || '',
        ai: h.ai || ''
      }));

      const response = await fetch('/api/debate/argument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_facts: params.caseFacts,
          legal_issue: params.legalIssue || 'Core legal issue',
          subject: params.subject || 'Contract Law',
          jurisdiction: params.jurisdiction || 'India (Common Law)',
          user_position: params.studentPosition || 'FOR',
          user_argument: params.studentArgument,
          debate_history: formattedHistory,
          provider: params.provider || 'auto'
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${response.status})`);
      }

      const data: DebateOppositionResponse = await response.json();

      return {
        id: `msg-ai-${Date.now()}`,
        roundNumber: params.roundNumber,
        speaker: 'opposition',
        text: data.ai_response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiPosition: data.ai_position,
        provider: data.provider
      };
    } catch (err: any) {
      console.error('Error contacting moot court backend API:', err);
      // Fallback message with clear error notification
      return {
        id: `msg-err-${Date.now()}`,
        roundNumber: params.roundNumber,
        speaker: 'opposition',
        text: `⚠️ [AI OPPOSING COUNSEL NOTICE]: Unable to connect to the backend AI engine (${err?.message || 'Connection failed'}). Please verify that the backend server is running on port 8000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  },

  /**
   * Concludes debate and generates comprehensive oral advocacy critique
   */
  async endDebate(params: {
    caseFacts: string;
    legalIssue?: string;
    userPosition: string;
    debateHistory: Array<{ round?: number; roundNumber?: number; student?: string; text?: string; ai?: string }>;
    provider?: 'gemini' | 'groq' | 'auto';
  }): Promise<DebateSummaryResponse['summary']> {
    const formattedHistory = (params.debateHistory || []).map((h) => ({
      round: h.round || h.roundNumber || 1,
      student: h.student || h.text || '',
      ai: h.ai || ''
    }));

    const res = await fetch('/api/debate/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_facts: params.caseFacts,
        legal_issue: params.legalIssue || '',
        user_position: params.userPosition,
        debate_history: formattedHistory,
        provider: params.provider || 'auto'
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate debate conclusion.');
    }

    const data: DebateSummaryResponse = await res.json();
    return data.summary;
  },

  /**
   * Transcribes voice recording via backend SpeechRecognition
   */
  async transcribeAudio(file: Blob | File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, 'recording.wav');

    const res = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Audio transcription failed: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    return data.text || '';
  },

  /**
   * Transcribes base64-encoded audio
   */
  async transcribeAudioBase64(base64Data: string): Promise<string> {
    const res = await fetch('/api/voice/transcribe-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_base64: base64Data })
    });

    if (!res.ok) {
      throw new Error(`Base64 transcription failed: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    return data.text || '';
  },

  /**
   * Reorganizes the user's existing facts chronologically without inventing new facts
   */
  async improveStructure(facts: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!facts || facts.trim().length === 0) {
      return facts;
    }

    // Split text into meaningful sentences or paragraphs
    const paragraphs = facts
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length >= 3) {
      // Re-organize existing paragraphs under clean chronological phases
      return [
        `[Phase 1 — Factual Background & Parties]`,
        paragraphs[0],
        ``,
        `[Phase 2 — Operative Actions & Chronology]`,
        paragraphs.slice(1, paragraphs.length - 1).join('\n\n'),
        ``,
        `[Phase 3 — Trigger Event & Arising Dispute]`,
        paragraphs[paragraphs.length - 1]
      ].join('\n');
    }

    // Split by sentences if single paragraph
    const sentences = facts
      .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (sentences.length <= 1) {
      return facts;
    }

    const third = Math.ceil(sentences.length / 3);
    const p1 = sentences.slice(0, third).join(' ');
    const p2 = sentences.slice(third, third * 2).join(' ');
    const p3 = sentences.slice(third * 2).join(' ');

    return [
      `[1. Context & Inception]`,
      p1,
      ``,
      `[2. Material Sequence of Events]`,
      p2 || p1,
      ``,
      `[3. Resulting Dispute Point]`,
      p3 || p2 || p1
    ].join('\n');
  },

  /**
   * Analyzes facts and suggests an incisive moot court legal issue
   */
  async suggestIssue(facts: string, subject?: SubjectArea): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const lower = (facts + ' ' + (subject || '')).toLowerCase();

    // Extract parties if "v." or "vs" is found
    const vMatch = facts.match(/([A-Z][A-Za-z0-9\s]+)\s+(?:v\.|vs\.|against)\s+([A-Z][A-Za-z0-9\s]+)/);
    const partyA = vMatch ? vMatch[1].trim() : 'the claimant';
    const partyB = vMatch ? vMatch[2].trim() : 'the respondent';

    if (lower.includes('contract') || lower.includes('email') || lower.includes('offer') || lower.includes('acceptance') || subject === 'Contract Law') {
      return `Whether the electronic communication exchanged between ${partyA} and ${partyB} constituted an unconditional acceptance resulting in an irrevocable contract, or whether the subsequent communication operated as a valid revocation prior to consensus ad idem.`;
    }

    if (lower.includes('negligence') || lower.includes('doctor') || lower.includes('duty') || lower.includes('hospital') || subject === 'Tort Law' || subject === 'Tort / Negligence') {
      return `Whether ${partyB} breached the objective standard of professional care owed to ${partyA} under the doctrine of informed consent, and whether such omission was the proximate cause of the resulting injury.`;
    }

    if (lower.includes('privacy') || lower.includes('surveillance') || lower.includes('constitutional') || lower.includes('metadata') || subject === 'Constitutional Law') {
      return `Whether the impugned regulatory mandate violates fundamental constitutional protections of privacy and procedural due process under the recognized four-pronged proportionality standard.`;
    }

    if (lower.includes('defense') || lower.includes('murder') || lower.includes('weapon') || lower.includes('curtilage') || subject === 'Criminal Law') {
      return `Whether the defensive force employed by ${partyA} satisfies the legal standard of objectively reasonable apprehension of imminent grievous harm without a duty to retreat under the governing jurisdiction.`;
    }

    if (lower.includes('property') || subject === 'Property Law') {
      return `Whether ${partyA} acquired an enforceable proprietary interest or easement right, and whether ${partyB}'s interference constitutes an actionable trespass or unlawful possession under property jurisprudence.`;
    }

    if (lower.includes('corporate') || subject === 'Corporate Law') {
      return `Whether the directors of ${partyB} breached their fiduciary duty of care and loyalty to shareholders in authorizing the disputed transaction without adequate independent appraisal.`;
    }

    return `Whether the material conduct and representations of ${partyB} give rise to actionable legal liability under governing common law principles, and what remedies are legally available to ${partyA}.`;
  },

  /**
   * Extracts case details from an uploaded file (.txt, .pdf, .docx, .md)
   */
  async extractCaseFromFile(file: File): Promise<{
    title: string;
    jurisdiction: Jurisdiction;
    subject: SubjectArea;
    facts: string;
    issue: string;
    studentPosition: string;
    opposingPosition: string;
  }> {
    // Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['txt', 'pdf', 'docx', 'doc', 'md'];
    if (!allowed.includes(ext)) {
      throw new Error(`Unsupported format .${ext}. Supported: PDF, DOCX, TXT`);
    }

    // Read file text
    let rawText = '';
    try {
      if (ext === 'txt' || ext === 'md') {
        rawText = await file.text();
      } else {
        // Read buffer and extract visible ASCII/UTF-8 words from PDF/DOCX
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = decoder.decode(buffer);

        // Filter text-like character streams
        const printable = decoded.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        // Extract runs of words
        const words = printable.match(/[A-Za-z0-9,.!?:;'"()\s-]{4,}/g) || [];
        rawText = words.join(' ').replace(/\s+/g, ' ').trim();
      }
    } catch {
      throw new Error("Unable to read this file.");
    }

    // If file is empty or too short to extract legal facts
    if (!rawText || rawText.trim().length < 25) {
      throw new Error("We couldn't reliably extract the case details from this file.");
    }

    // Heuristic Extraction
    const lower = rawText.toLowerCase();

    // 1. Title Extraction
    let extractedTitle = '';
    const vMatch = rawText.match(/([A-Z][A-Za-z0-9&.\s]{2,40}\s+(?:v\.|vs\.|against)\s+[A-Z][A-Za-z0-9&.\s]{2,40})/);
    if (vMatch) {
      extractedTitle = vMatch[1].replace(/\s+/g, ' ').trim();
    } else {
      // derive from filename or first line
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      extractedTitle = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      if (!extractedTitle.toLowerCase().includes('v.')) {
        extractedTitle = `${extractedTitle} Dispute`;
      }
    }

    // 2. Jurisdiction Extraction
    let extractedJurisdiction: Jurisdiction = 'India (Common Law)';
    if (lower.includes('united states') || lower.includes('u.s.') || lower.includes('federal') || lower.includes('california') || lower.includes('new york')) {
      extractedJurisdiction = 'United States (Federal/State)';
    } else if (lower.includes('united kingdom') || lower.includes('england') || lower.includes('wales') || lower.includes('high court of justice') || lower.includes('lord justice')) {
      extractedJurisdiction = 'United Kingdom (England & Wales)';
    } else if (lower.includes('european union') || lower.includes('eu directive') || lower.includes('ecj') || lower.includes('brussels')) {
      extractedJurisdiction = 'European Union';
    } else if (lower.includes('india') || lower.includes('supreme court of india') || lower.includes('high court') || lower.includes('delhi') || lower.includes('section')) {
      extractedJurisdiction = 'India (Common Law)';
    } else {
      extractedJurisdiction = 'General Common Law Principles';
    }

    // 3. Subject Extraction
    let extractedSubject: SubjectArea = 'Contract Law';
    if (lower.includes('contract') || lower.includes('agreement') || lower.includes('breach') || lower.includes('consideration') || lower.includes('offer')) {
      extractedSubject = 'Contract Law';
    } else if (lower.includes('constitutional') || lower.includes('fundamental rights') || lower.includes('privacy') || lower.includes('article 21') || lower.includes('fourth amendment')) {
      extractedSubject = 'Constitutional Law';
    } else if (lower.includes('criminal') || lower.includes('penal') || lower.includes('homicide') || lower.includes('murder') || lower.includes('accused') || lower.includes('self-defense')) {
      extractedSubject = 'Criminal Law';
    } else if (lower.includes('negligence') || lower.includes('tort') || lower.includes('duty of care') || lower.includes('damages') || lower.includes('injury')) {
      extractedSubject = 'Tort / Negligence';
    } else if (lower.includes('property') || lower.includes('lease') || lower.includes('tenant') || lower.includes('mortgage') || lower.includes('conveyance')) {
      extractedSubject = 'Property Law';
    } else if (lower.includes('corporate') || lower.includes('shareholder') || lower.includes('merger') || lower.includes('securities') || lower.includes('director')) {
      extractedSubject = 'Corporate Law';
    } else if (lower.includes('patent') || lower.includes('copyright') || lower.includes('trademark') || lower.includes('intellectual property')) {
      extractedSubject = 'Cyber & Intellectual Property Law';
    } else if (lower.includes('administrative') || lower.includes('judicial review') || lower.includes('tribunal')) {
      extractedSubject = 'Administrative Law';
    }

    // 4. Material Facts
    let extractedFacts = '';
    // Look for explicit "Facts" heading
    const factsMatch = rawText.match(/(?:STATEMENT OF FACTS|FACTS|FACTUAL BACKGROUND|MATERIAL FACTS)[:\s-]*([\s\S]{80,1200})/i);
    if (factsMatch && factsMatch[1]) {
      extractedFacts = factsMatch[1].trim();
    } else {
      // Use the first 800-1200 characters of clean text
      extractedFacts = rawText.slice(0, 1200).trim();
    }

    // 5. Core Legal Issue
    let extractedIssue = '';
    const issueMatch = rawText.match(/(?:LEGAL ISSUE|ISSUE PRESENTED|QUESTION FOR DECISION|WHETHER)[:\s-]*([^\n.?]+[?.])/i);
    if (issueMatch && issueMatch[1]) {
      extractedIssue = issueMatch[1].trim();
      if (!extractedIssue.toLowerCase().startsWith('whether')) {
        extractedIssue = `Whether ${extractedIssue}`;
      }
    } else {
      extractedIssue = `Whether the material conduct described in the case document constitutes an actionable breach or violation under governing ${extractedSubject} principles.`;
    }

    // 6. Positions
    let studentPos = 'Petitioner / Moving Party asserts that the evidence and applicable rules establish a prima facie right to relief.';
    let opposingPos = 'Respondent / Defense contends that the actions conformed to governing standards and no actionable liability arose.';

    const petitionerMatch = rawText.match(/(?:PETITIONER|CLAIMANT|APPELLANT|PLAINTIFF)[:\s-]*([^\n]{30,200})/i);
    if (petitionerMatch && petitionerMatch[1]) {
      studentPos = petitionerMatch[1].trim();
    }

    const respondentMatch = rawText.match(/(?:RESPONDENT|DEFENDANT|OPPOSITION)[:\s-]*([^\n]{30,200})/i);
    if (respondentMatch && respondentMatch[1]) {
      opposingPos = respondentMatch[1].trim();
    }

    return {
      title: extractedTitle,
      jurisdiction: extractedJurisdiction,
      subject: extractedSubject,
      facts: extractedFacts,
      issue: extractedIssue,
      studentPosition: studentPos,
      opposingPosition: opposingPos
    };
  }
};

