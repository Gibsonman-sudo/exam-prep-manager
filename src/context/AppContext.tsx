import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppState, Subject, Chapter, Topic, StudySession, DailyStudyLog } from '../types';
import { storageService } from '../utils/storage';
import { calculateStreak } from '../utils/calculations';

interface AppContextType extends AppState {
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'chapters'>) => void;
  addSubjectWithChapters: (
    subject: Omit<Subject, 'id' | 'createdAt' | 'chapters'>,
    chapters: Omit<Chapter, 'id' | 'createdAt'>[]
  ) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addChapter: (subjectId: string, chapter: Omit<Chapter, 'id' | 'createdAt' | 'topics'>) => void;
  updateChapter: (subjectId: string, chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (subjectId: string, chapterId: string) => void;
  addTopic: (subjectId: string, chapterId: string, topic: Omit<Topic, 'id' | 'createdAt'>) => void;
  updateTopic: (subjectId: string, chapterId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
  startStudySession: (subjectId: string, chapterId?: string) => void;
  stopStudySession: (notes?: string) => void;
  addManualSession: (session: Omit<StudySession, 'id'>) => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearData: () => void;
  clearCompletedSubjects: () => void;
  updateStudyGoal: (dailyMinutes: number, weeklyMinutes: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => storageService.load());

  // Save to localStorage whenever state changes
  useEffect(() => {
    storageService.save(state);
  }, [state]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt' | 'chapters'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: generateId(),
      chapters: [],
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  }, []);

  const addSubjectWithChapters = useCallback((
    subjectData: Omit<Subject, 'id' | 'createdAt' | 'chapters'>,
    chaptersData: Omit<Chapter, 'id' | 'createdAt'>[]
  ) => {
    const newChapters: Chapter[] = chaptersData.map(chapterData => ({
      ...chapterData,
      id: generateId(),
      topics: chapterData.topics || [],
      createdAt: new Date().toISOString(),
    }));

    const newSubject: Subject = {
      ...subjectData,
      id: generateId(),
      chapters: newChapters,
      createdAt: new Date().toISOString(),
    };
    
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      studySessions: prev.studySessions.filter(s => s.subjectId !== id),
    }));
  }, []);

  const addChapter = useCallback((subjectId: string, chapterData: Omit<Chapter, 'id' | 'createdAt' | 'topics'>) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: generateId(),
      topics: [],
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s
      ),
    }));
  }, []);

  const updateChapter = useCallback((subjectId: string, chapterId: string, updates: Partial<Chapter>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId
          ? { ...s, chapters: s.chapters.map(c => c.id === chapterId ? { ...c, ...updates } : c) }
          : s
      ),
    }));
  }, []);

  const deleteChapter = useCallback((subjectId: string, chapterId: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId ? { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) } : s
      ),
    }));
  }, []);

  const addTopic = useCallback((subjectId: string, chapterId: string, topicData: Omit<Topic, 'id' | 'createdAt'>) => {
    const newTopic: Topic = {
      ...topicData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId ? { ...c, topics: [...c.topics, newTopic] } : c
              ),
            }
          : s
      ),
    }));
  }, []);

  const updateTopic = useCallback((subjectId: string, chapterId: string, topicId: string, updates: Partial<Topic>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId
                  ? { ...c, topics: c.topics.map(t => t.id === topicId ? { ...t, ...updates } : t) }
                  : c
              ),
            }
          : s
      ),
    }));
  }, []);

  const deleteTopic = useCallback((subjectId: string, chapterId: string, topicId: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId ? { ...c, topics: c.topics.filter(t => t.id !== topicId) } : c
              ),
            }
          : s
      ),
    }));
  }, []);

  const startStudySession = useCallback((subjectId: string, chapterId?: string) => {
    const now = new Date();
    const newSession: StudySession = {
      id: generateId(),
      subjectId,
      chapterId,
      startTime: now.toISOString(),
      durationMinutes: 0,
      date: now.toISOString().split('T')[0],
    };
    setState(prev => ({ ...prev, currentSession: newSession }));
  }, []);

  const stopStudySession = useCallback((notes?: string) => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      const session = prev.currentSession;
      const endTime = new Date();
      const startTime = new Date(session.startTime);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

      const completedSession: StudySession = {
        ...session,
        endTime: endTime.toISOString(),
        durationMinutes,
        notes,
      };

      // Update chapter actual study time if chapter specified
      let updatedSubjects = prev.subjects;
      if (session.chapterId) {
        updatedSubjects = prev.subjects.map(s => {
          if (s.id !== session.subjectId) return s;
          return {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === session.chapterId
                ? { ...c, actualStudyTime: (c.actualStudyTime || 0) + durationMinutes, lastStudiedAt: endTime.toISOString() }
                : c
            ),
          };
        });
      }

      // Update daily log
      const today = new Date().toISOString().split('T')[0];
      const existingLogIndex = prev.dailyLogs.findIndex(log => log.date === today);
      
      let updatedLogs: DailyStudyLog[];
      if (existingLogIndex >= 0) {
        updatedLogs = prev.dailyLogs.map((log, idx) =>
          idx === existingLogIndex
            ? {
                ...log,
                totalMinutes: log.totalMinutes + durationMinutes,
                sessions: [...log.sessions, completedSession],
              }
            : log
        );
      } else {
        updatedLogs = [
          ...prev.dailyLogs,
          { date: today, totalMinutes: durationMinutes, sessions: [completedSession] },
        ];
      }

      const streak = calculateStreak(updatedLogs);

      return {
        ...prev,
        subjects: updatedSubjects,
        studySessions: [...prev.studySessions, completedSession],
        dailyLogs: updatedLogs,
        currentSession: null,
        lastStudyDate: today,
        studyStreak: streak,
      };
    });
  }, []);

  const addManualSession = useCallback((session: Omit<StudySession, 'id'>) => {
    setState(prev => {
      const newSession: StudySession = {
        ...session,
        id: generateId(),
      };

      // Update chapter actual study time if chapter specified
      let updatedSubjects = prev.subjects;
      if (session.chapterId) {
        updatedSubjects = prev.subjects.map(s => {
          if (s.id !== session.subjectId) return s;
          return {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === session.chapterId
                ? { 
                    ...c, 
                    actualStudyTime: (c.actualStudyTime || 0) + session.durationMinutes,
                    lastStudiedAt: session.endTime || new Date().toISOString()
                  }
                : c
            ),
          };
        });
      }

      // Update daily log
      const sessionDate = session.date || new Date().toISOString().split('T')[0];
      const existingLogIndex = prev.dailyLogs.findIndex(log => log.date === sessionDate);
      
      let updatedLogs: DailyStudyLog[];
      if (existingLogIndex >= 0) {
        updatedLogs = prev.dailyLogs.map((log, idx) =>
          idx === existingLogIndex
            ? {
                ...log,
                totalMinutes: log.totalMinutes + session.durationMinutes,
                sessions: [...log.sessions, newSession],
              }
            : log
        );
      } else {
        updatedLogs = [
          ...prev.dailyLogs,
          { date: sessionDate, totalMinutes: session.durationMinutes, sessions: [newSession] },
        ].sort((a, b) => b.date.localeCompare(a.date));
      }

      const streak = calculateStreak(updatedLogs);

      return {
        ...prev,
        subjects: updatedSubjects,
        studySessions: [...prev.studySessions, newSession],
        dailyLogs: updatedLogs,
        lastStudyDate: sessionDate,
        studyStreak: streak,
      };
    });
  }, []);

  const exportData = useCallback(() => storageService.exportData(), []);
  
  const importData = useCallback((jsonString: string) => {
    const success = storageService.importData(jsonString);
    if (success) {
      setState(storageService.load());
    }
    return success;
  }, []);

  const clearData = useCallback(() => {
    storageService.clear();
    setState(storageService.load());
  }, []);

  const clearCompletedSubjects = useCallback(() => {
    storageService.clearCompletedSubjects();
    setState(storageService.load());
  }, []);

  const updateStudyGoal = useCallback((dailyMinutes: number, weeklyMinutes: number) => {
    setState(prev => ({
      ...prev,
      studyGoal: {
        dailyMinutes,
        weeklyMinutes,
      },
    }));
  }, []);

  const value: AppContextType = {
    ...state,
    addSubject,
    addSubjectWithChapters,
    updateSubject,
    deleteSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    addTopic,
    updateTopic,
    deleteTopic,
    startStudySession,
    stopStudySession,
    addManualSession,
    exportData,
    importData,
    clearData,
    clearCompletedSubjects,
    updateStudyGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
