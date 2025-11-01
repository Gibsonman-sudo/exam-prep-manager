import type { Subject, Chapter, Topic, Status } from '../types';

// Calculate progress percentage for a topic
export const calculateTopicProgress = (topic: Topic): number => {
  return topic.status === 'completed' ? 100 : 
         topic.status === 'in-progress' ? 50 : 0;
};

// Calculate progress percentage for a chapter
export const calculateChapterProgress = (chapter: Chapter): number => {
  if (chapter.topics.length === 0) return 0;
  
  const totalProgress = chapter.topics.reduce(
    (sum, topic) => sum + calculateTopicProgress(topic),
    0
  );
  return totalProgress / chapter.topics.length;
};

// Calculate progress percentage for a subject
export const calculateSubjectProgress = (subject: Subject): number => {
  if (subject.chapters.length === 0) return 0;
  
  const totalProgress = subject.chapters.reduce(
    (sum, chapter) => sum + calculateChapterProgress(chapter),
    0
  );
  return totalProgress / subject.chapters.length;
};

// Calculate overall progress across all subjects
export const calculateOverallProgress = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  
  const totalProgress = subjects.reduce(
    (sum, subject) => sum + calculateSubjectProgress(subject),
    0
  );
  return totalProgress / subjects.length;
};

// Get days until exam
export const daysUntilExam = (examDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  
  const diffTime = exam.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if deadline is overdue
export const isOverdue = (deadline: string): boolean => {
  return new Date(deadline) < new Date();
};

// Format minutes to readable time
export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get status badge color classes
export const getStatusColor = (status: Status): string => {
  switch (status) {
    case 'not-started':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'in-progress':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'needs-review':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    default:
      return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
  }
};

// Get priority badge color classes
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-zinc-700 text-zinc-300';
    case 'medium':
      return 'bg-blue-600 text-blue-100';
    case 'high':
      return 'bg-orange-600 text-orange-100';
    case 'critical':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-zinc-700 text-zinc-300';
  }
};

// Get subject color classes
export const getSubjectColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-600 border-red-500',
    orange: 'bg-orange-600 border-orange-500',
    yellow: 'bg-yellow-600 border-yellow-500',
    green: 'bg-green-600 border-green-500',
    blue: 'bg-blue-600 border-blue-500',
    indigo: 'bg-indigo-600 border-indigo-500',
    purple: 'bg-purple-600 border-purple-500',
    pink: 'bg-pink-600 border-pink-500',
  };
  return colorMap[color] || colorMap.blue;
};

// Suggest next subject to study
export const suggestNextSubject = (subjects: Subject[]): Subject | null => {
  if (subjects.length === 0) return null;

  // Score each subject based on urgency
  const scored = subjects.map(subject => {
    const progress = calculateSubjectProgress(subject);
    const daysLeft = daysUntilExam(subject.examDate);
    const priorityWeight = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    }[subject.priority];

    // Higher score = more urgent
    let score = 0;
    
    // Low progress with near exam is very urgent
    if (progress < 30 && daysLeft < 7) score += 100;
    if (progress < 50 && daysLeft < 14) score += 50;
    
    // Days left (closer = higher score)
    score += Math.max(0, 30 - daysLeft) * 2;
    
    // Priority multiplier
    score *= priorityWeight;
    
    // Incomplete subjects get boost
    if (progress < 100) score += 20;

    return { subject, score };
  });

  // Return subject with highest score
  scored.sort((a, b) => b.score - a.score);
  return scored[0].subject;
};

// Calculate study streak
export const calculateStreak = (dailyLogs: { date: string; totalMinutes: number }[]): number => {
  if (dailyLogs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Sort logs by date descending
  const sorted = [...dailyLogs]
    .filter(log => log.totalMinutes > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let checkDate = new Date(today);

  for (const log of sorted) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    
    if (logDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (logDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
};
