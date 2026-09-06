import { jsPDF } from 'jspdf';
import { LegalCaseSession } from '../types';

export const exportService = {
  /**
   * Generates and downloads a clean, professional legal brief PDF using jsPDF
   */
  exportToPDF(session: LegalCaseSession): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;

    // Header styling
    doc.setFillColor(18, 18, 20);
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('LEXORA — MOOT COURT PRACTICE BRIEF', margin, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`SUBJECT: ${session.subject.toUpperCase()}   |   JURISDICTION: ${session.jurisdiction.toUpperCase()}`, margin, 24);
    doc.text(`DATE: ${new Date().toLocaleDateString()}   |   DOCUMENT ID: ${session.id}`, margin, 30);

    y = 48;

    // Persistent Educational Banner at top of document
    doc.setDrawColor(234, 88, 12);
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('EDUCATIONAL PRACTICE INSTRUMENT — NOT PROFESSIONAL LEGAL ADVICE', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('General legal principles and analysis generated for student moot court preparation.', margin + 4, y + 10);

    y += 22;

    // Case Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(session.title || 'Moot Court Legal Argument', margin, y);
    y += 8;

    // Helper function for adding sections
    const addSection = (title: string, text: string) => {
      if (y > 250) {
        doc.addPage();
        y = 22;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(title.toUpperCase(), margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      const splitText = doc.splitTextToSize(text, contentWidth);
      doc.text(splitText, margin, y);
      y += splitText.length * 4.8 + 8;
    };

    // Case Facts
    addSection('I. STATEMENT OF RELEVANT FACTS', session.caseFacts);

    // If IRAC argument is present
    if (session.iracArgument) {
      addSection('II. LEGAL ISSUE FOR ADJUDICATION', session.iracArgument.issue);

      const ruleContent = `${session.iracArgument.rule.generalFramework}\n\nKey Principles:\n` + 
        session.iracArgument.rule.principles.map((p, idx) => `  ${idx + 1}. ${p.doctrineName}: ${p.statement} [${p.sourceType}]`).join('\n\n');
      addSection('III. RELEVANT LEGAL RULES & DOCTRINES (GENERAL PRINCIPLES)', ruleContent);

      const appContent = `${session.iracArgument.application.synthesis}\n\nKey Factual Grounds:\n` + 
        session.iracArgument.application.factualPointsApplied.map((p, idx) => `  • ${p}`).join('\n');
      addSection('IV. APPLICATION OF LAW TO FACTS', appContent);

      const concContent = `${session.iracArgument.conclusion.primaryFinding}\n\nAdvocacy Strategy:\n${session.iracArgument.conclusion.practicalAdviceForMoot}`;
      addSection('V. CONCLUSION & ADVOCACY SUBMISSIONS', concContent);
    }

    // Opposition points if present
    if (session.counterArgument) {
      const counterContent = `Core Opposing Position:\n${session.counterArgument.oppositionCoreTheory}\n\nKey Vulnerabilities to Rebut:\n` +
        session.counterArgument.ruleVulnerabilities.map(v => `  - ${v}`).join('\n');
      addSection('VI. ADVERSARIAL OPPOSITION & REBUTTAL TARGETS', counterContent);
    }

    // Page numbering and footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Lexora Educational Practice Tool — Generated for Moot Court Practice Only',
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 15,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save(`${(session.title || 'lexora-practice-brief').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
  },

  /**
   * Generates and downloads a clean text file
   */
  exportToTXT(session: LegalCaseSession): void {
    let content = `========================================================================\n`;
    content += `LEXORA — AI MOOT COURT & LEGAL REASONING ASSISTANT\n`;
    content += `EDUCATIONAL PRACTICE BRIEF — NOT FORMAL LEGAL ADVICE\n`;
    content += `========================================================================\n\n`;
    content += `TITLE:        ${session.title}\n`;
    content += `SUBJECT:      ${session.subject}\n`;
    content += `JURISDICTION: ${session.jurisdiction}\n`;
    content += `DATE:         ${new Date().toLocaleString()}\n`;
    content += `SESSION ID:   ${session.id}\n\n`;

    content += `------------------------------------------------------------------------\n`;
    content += `I. STATEMENT OF FACTS\n`;
    content += `------------------------------------------------------------------------\n`;
    content += `${session.caseFacts}\n\n`;

    if (session.iracArgument) {
      content += `------------------------------------------------------------------------\n`;
      content += `II. LEGAL ISSUE\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `${session.iracArgument.issue}\n\n`;

      content += `------------------------------------------------------------------------\n`;
      content += `III. RELEVANT RULES & GENERAL DOCTRINES\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `${session.iracArgument.rule.generalFramework}\n\n`;
      session.iracArgument.rule.principles.forEach((p, idx) => {
        content += `Principle ${idx + 1}: ${p.doctrineName}\n`;
        content += `Doctrine:    ${p.statement}\n`;
        content += `Type:        ${p.sourceType} (${p.verificationNotice})\n\n`;
      });

      content += `------------------------------------------------------------------------\n`;
      content += `IV. APPLICATION TO FACTS\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `${session.iracArgument.application.synthesis}\n\n`;
      content += `Factual Points Applied:\n`;
      session.iracArgument.application.factualPointsApplied.forEach(pt => {
        content += `  * ${pt}\n`;
      });
      content += `\n`;

      content += `------------------------------------------------------------------------\n`;
      content += `V. CONCLUSION & MOOT ADVOCACY ADVICE\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `${session.iracArgument.conclusion.primaryFinding}\n\n`;
      content += `Oral Advocacy Tip: ${session.iracArgument.conclusion.practicalAdviceForMoot}\n\n`;
    }

    if (session.counterArgument) {
      content += `------------------------------------------------------------------------\n`;
      content += `VI. OPPOSITION COUNTER-ARGUMENT ANALYSIS\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `Opposing Core Theory: ${session.counterArgument.oppositionCoreTheory}\n\n`;
      content += `Rebuttal Tactics:\n`;
      session.counterArgument.suggestedRebuttalTactics.forEach(t => {
        content += `  - ${t}\n`;
      });
      content += `\n`;
    }

    content += `========================================================================\n`;
    content += `PERSISTENT DISCLAIMER:\n`;
    content += `Lexora provides educational and practice-oriented legal content only and is\n`;
    content += `not a substitute for professional legal advice. AI-generated material must\n`;
    content += `be independently verified before any real-world application.\n`;
    content += `========================================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(session.title || 'lexora-brief').toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Copies formatted brief to clipboard
   */
  async copyBriefToClipboard(session: LegalCaseSession): Promise<boolean> {
    try {
      let text = `LEXORA MOOT COURT BRIEF: ${session.title}\n`;
      text += `Subject: ${session.subject} | Jurisdiction: ${session.jurisdiction}\n\n`;
      text += `FACTS:\n${session.caseFacts}\n\n`;

      if (session.iracArgument) {
        text += `ISSUE:\n${session.iracArgument.issue}\n\n`;
        text += `RULE:\n${session.iracArgument.rule.generalFramework}\n\n`;
        text += `APPLICATION:\n${session.iracArgument.application.synthesis}\n\n`;
        text += `CONCLUSION:\n${session.iracArgument.conclusion.primaryFinding}\n\n`;
      }

      text += `[Notice: Lexora Educational Practice Material — Independent legal verification required]`;
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
};
