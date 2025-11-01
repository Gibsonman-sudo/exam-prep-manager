import type { AppState, Subject, StudySession, DailyStudyLog } from '../types';

const STORAGE_KEY = 'exam-prep-data';
const STORAGE_VERSION = '1.0';

const defaultState: AppState = {
  subjects: [],
  studySessions: [],
  dailyLogs: [],
  currentSession: null,
  lastStudyDate: null,
  studyStreak: 0,
  studyGoal: {
    dailyMinutes: 120, // Default: 2 hours per day
    weeklyMinutes: 600, // Default: 10 hours per week
  },
};

export const storageService = {
  // Load data from localStorage
  load(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState;
      
      const parsed = JSON.parse(raw);
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, resetting data');
        return defaultState;
      }
      return parsed.data || defaultState;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultState;
    }
  },

  // Save data to localStorage
  save(state: AppState): void {
    try {
      const payload = {
        version: STORAGE_VERSION,
        data: state,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  // Export data as JSON for backup
  exportData(): string {
    const state = this.load();
    return JSON.stringify({
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: state,
    }, null, 2);
  },

  // Import data from JSON backup
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        throw new Error('Invalid data format');
      }
      this.save(parsed.data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Clear all data
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Clear only completed subjects (after exam)
  clearCompletedSubjects(): void {
    const state = this.load();
    const now = new Date();
    
    state.subjects = state.subjects.filter(subject => {
      const examDate = new Date(subject.examDate);
      return examDate >= now; // Keep upcoming exams
    });
    
    this.save(state);
  },
};
