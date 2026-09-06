import { CaseTemplate } from '../types';

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'contract-email-dispute',
    name: 'Contract Law — Electronic Acceptance & Revocation',
    subject: 'Contract Law',
    jurisdiction: 'India (Common Law)',
    legalContext: 'India',
    title: 'AeroTech Dynamics v. Orion Logistics',
    description: 'A commercial dispute over whether an automated email confirmation and payment link constitutes a binding acceptance before an explicit revocation.',
    facts: `AeroTech Dynamics sent a detailed quotation to Orion Logistics for the supply of 50 precision drone sensors at a rate of ₹1,20,000 per unit, specifying that the quote remained open for acceptance until October 15. 

On October 12 at 4:30 PM, Orion Logistics replied via corporate email stating: 'We accept your terms and request shipment initiation under Purchase Order #8821.'

At 4:32 PM, an automated receipt and payment schedule link was generated and dispatched by AeroTech's enterprise server. 

However, at 5:10 PM the same afternoon, AeroTech's Chief Commercial Officer sent a manual email stating: 'Due to sudden semiconductor supply shocks, our quote is immediately withdrawn and nullified.'

Orion Logistics contends a binding contract was formed at 4:30 PM upon dispatch of their acceptance email. AeroTech contends no human agent had acknowledged the acceptance and price escalation allows termination before formal contract execution.`,
    issue: 'Does the communication of an acceptance via electronic email create a binding, irrevocable contract upon receipt in the offeror’s inbox, or does the offeror retain a right of revocation prior to human review or performance?',
    studentPosition: 'Orion Logistics (Petitioner/Buyer): A valid contract was formed when the acceptance was transmitted and entered the recipient’s server, rendering subsequent unilateral revocation invalid.',
    opposingPosition: 'AeroTech Dynamics (Respondent/Seller): The automated server response was a mere acknowledgement of receipt rather than communicated consensus, and revocation preceded any detrimental reliance.'
  },
  {
    id: 'tort-medical-negligence',
    name: 'Tort Law — Standard of Care & Informed Consent',
    subject: 'Tort Law',
    jurisdiction: 'General Common Law Principles',
    legalContext: 'General',
    title: 'Elena Vance v. St. Jude Healthcare Trust',
    description: 'Medical negligence claim evaluating the standard of care, material risk disclosure, and the Bolam vs. Montgomery doctrine of informed consent.',
    facts: `The plaintiff, Elena Vance, underwent a specialized orthopedic spinal decompression surgery performed by Dr. Aris Thorne at St. Jude Hospital. 

Prior to surgery, Dr. Thorne disclosed common complications including minor nerve tingling and infection risks (incidence ~5%). However, Dr. Thorne did not disclose a rare 0.8% risk of persistent cauda equina sensory paralysis because standard surgical practice in that medical community did not routinely alarm patients with sub-1% non-fatal risks.

Post-surgery, Elena suffered persistent nerve entrapment resulting in lower-limb motor impairment. Independent expert witnesses confirmed that the surgical technique was executed with exemplary surgical skill. 

Elena argues that had she been informed of the 0.8% paralysis risk, she would have opted for conservative physiotherapy rather than elective surgical intervention.`,
    issue: 'Does the failure to disclose a rare but life-altering 0.8% surgical risk breach the legal duty of care owed to a patient under modern doctrines of informed consent, even when surgical execution satisfies the standard of professional competence?',
    studentPosition: 'Plaintiff (Elena Vance): A reasonable patient in the plaintiff’s position would attach significance to a permanent paralysis risk; failure to disclose vitiates informed consent.',
    opposingPosition: 'Defendant (St. Jude Trust): The medical practitioner acted in accordance with a responsible body of professional medical opinion at the time, negating actionable negligence.'
  },
  {
    id: 'constitutional-digital-privacy',
    name: 'Constitutional Law — Digital Surveillance & Proportionality',
    subject: 'Constitutional Law',
    jurisdiction: 'India (Common Law)',
    legalContext: 'India',
    title: 'Citizens for Digital Liberty v. Union Telecom Regulatory Board',
    description: 'Fundamental rights challenge assessing whether warrantless mass metadata harvesting violates the constitutional right to privacy under the proportionality standard.',
    facts: `Under executive notification No. 44/2025, the national telecommunications authority mandated that all internet service providers retain comprehensive user IP connection logs, cell tower geolocation data, and encrypted packet header telemetry for 24 months. 

The directive permits designated national security intelligence officers to inspect metadata logs without prior judicial warrant upon certifying in writing that the inspection pertains to 'prevention of public disorder'.

The petitioner, a civil liberties association, filed a constitutional writ petition challenging the executive notification as ultra vires and a direct infringement of the fundamental right to privacy.

The state contends that telemetry and connection metadata do not constitute protected personal communication content, and that rapid counter-terrorism intelligence requires non-judicial administrative access.`,
    issue: 'Does the warrantless administrative surveillance and mandatory 24-month retention of telecommunications metadata satisfy the constitutional test of proportionality and legitimate state aim?',
    studentPosition: 'Petitioners: Metadata reveals intimate behavioural profiles; bulk retention without judicial oversight fails the proportionality and least-intrusive-means tests.',
    opposingPosition: 'State Respondents: Metadata is non-substantive routing information; national security imperatives justify administrative oversight with post-facto ministerial review.'
  },
  {
    id: 'criminal-self-defense',
    name: 'Criminal Law — Mens Rea & Imminence in Self-Defense',
    subject: 'Criminal Law',
    jurisdiction: 'United States (Federal/State)',
    legalContext: 'United States',
    title: 'State v. Marcus Brody',
    description: 'Homicide prosecution where the defendant claims justification of self-defense based on perceived imminent threat inside a curtilage enclosure.',
    facts: `Late at night around 11:45 PM, defendant Marcus Brody heard shattering glass in his detached backyard tool workshop. 

Brody armed himself with a licensed handgun and stepped into the backyard. He observed an intruder, later identified as Keith Vance, holding a heavy steel crowbar near the entrance of the workshop.

Brody shouted: 'Drop the tool and step back.' Vance turned abruptly, raised the crowbar, and advanced two rapid strides toward Brody in the poorly illuminated yard. 

Brody discharged his weapon twice from a distance of approximately 10 feet, fatally wounding Vance. Forensic analysis later revealed Vance was unarmed other than the crowbar, but was severely intoxicated. 

The prosecution charged Brody with second-degree murder, alleging Brody had a safe retreat pathway back into his locked house and that lethal force was disproportionate before verbal de-escalation was exhausted.`,
    issue: 'Did the defendant possess an objectively reasonable apprehension of imminent death or grievous bodily harm justifying the use of lethal force under the Castle Doctrine / self-defense principles?',
    studentPosition: 'Defendant (Marcus Brody): The dark environment, raised weapon, and aggressive advance created an objectively reasonable belief of lethal danger with no duty to retreat from one’s curtilage.',
    opposingPosition: 'Prosecution (The State): The defendant escalated a property intrusion by confronting the intruder with a firearm, and lethal force exceeded the necessity of the immediate situation.'
  }
];
