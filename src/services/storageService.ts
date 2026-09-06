import { LegalCaseSession } from '../types';
import { CASE_TEMPLATES } from '../data/templates';

const STORAGE_KEY = 'lexora_legal_sessions';

export const storageService = {
  /**
   * Retrieves all saved sessions from localStorage, seeding starter cases if empty
   */
  getSessions(): LegalCaseSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    // Seed initial demo cases from templates for immediate out-of-the-box demo
    const seededSessions: LegalCaseSession[] = CASE_TEMPLATES.map((tmpl, index) => {
      const now = new Date(Date.now() - (index * 86400000 * 2));
      return {
        id: `sess-${tmpl.id}`,
        title: tmpl.title,
        caseFacts: tmpl.facts,
        legalIssue: tmpl.issue,
        subject: tmpl.subject,
        jurisdiction: tmpl.jurisdiction,
        legalContext: tmpl.legalContext || 'India',
        mode: 'argument',
        studentPosition: tmpl.studentPosition,
        opposingPosition: tmpl.opposingPosition,
        messages: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seededSessions));
    } catch {
      // storage unavailable or full
    }

    return seededSessions;
  },

  /**
   * Gets a specific session by ID
   */
  getSessionById(id: string): LegalCaseSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id);
  },

  /**
   * Saves or updates a session
   */
  saveSession(session: LegalCaseSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    const updated: LegalCaseSession = {
      ...session,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = updated;
    } else {
      sessions.unshift(updated);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving session to localStorage', e);
    }
  },

  /**
   * Deletes a session by ID
   */
  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error deleting session', e);
    }
  }
};
