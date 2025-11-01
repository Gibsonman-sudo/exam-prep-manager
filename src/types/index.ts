// Core domain types for exam prep tracker

export enum Status {
  NotStarted = 'not-started',
  InProgress = 'in-progress',
  Completed = 'completed',
  NeedsReview = 'needs-review',
}

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum SubjectColor {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Indigo = 'indigo',
  Purple = 'purple',
  Pink = 'pink',
}

export interface Topic {
  id: string;
  name: string;
  status: Status;
  notes: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  actualMinutes: number;
  createdAt: string;
  completedAt?: string;
}

export interface Chapter {
  id: string;
  number: number;
  name: string;
  topics: Topic[];
  status: Status;
  deadline?: string;
  estimatedStudyTime?: number; // in minutes
  actualStudyTime?: number; // in minutes
  lastStudiedAt?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  examDate: string;
  totalChapters: number;
  priority: Priority;
  color: SubjectColor;
  chapters: Chapter[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessions: StudySession[];
}

export interface StudyGoal {
  dailyMinutes: number;
  weeklyMinutes: number;
}

export interface AppState {
  subjects: Subject[];
  studySessions: StudySession[];
  dailyLogs: DailyStudyLog[];
  currentSession: StudySession | null;
  lastStudyDate: string | null;
  studyStreak: number;
  studyGoal: StudyGoal;
}

export interface ProgressStats {
  overallProgress: number;
  subjectProgress: Record<string, number>;
  todayMinutes: number;
  weekMinutes: number;
  streak: number;
}
