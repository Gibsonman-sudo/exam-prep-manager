import React from 'react';
import { useApp } from '../context/AppContext';

interface Insight {
  type: 'urgent' | 'goal' | 'inactive' | 'success';
  icon: string;
  title: string;
  message: string;
}

const PriorityInsights: React.FC = () => {
  const { subjects, dailyLogs, studyGoal, studyStreak } = useApp();

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check for urgent exams
    const urgentExams = subjects.filter(s => {
      if (!s.examDate) return false;
      const examDate = new Date(s.examDate);
      const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const progress = s.chapters.length > 0
        ? (s.chapters.filter(c => c.status === 'completed').length / s.chapters.length) * 100
        : 0;
      return daysUntil > 0 && daysUntil <= 7 && progress < 70;
    });

    if (urgentExams.length > 0) {
      insights.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Urgent Attention Needed',
        message: `${urgentExams.length} exam${urgentExams.length > 1 ? 's' : ''} in the next 7 days with low progress`,
      });
    }

    // Check today's study goal progress
    const todayLog = dailyLogs.find(log => log.date === todayStr);
    const todayMinutes = todayLog?.totalMinutes || 0;
    const goalMinutes = studyGoal?.dailyMinutes || 120; // Default 2 hours
    const remainingMinutes = goalMinutes - todayMinutes;

    if (remainingMinutes > 0 && remainingMinutes <= 60) {
      insights.push({
        type: 'goal',
        icon: '🎯',
        title: 'Almost There!',
        message: `You've studied ${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m today - just ${remainingMinutes} min to hit your goal!`,
      });
    } else if (todayMinutes >= goalMinutes) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Goal Achieved!',
        message: `You've reached your daily goal of ${Math.floor(goalMinutes / 60)}h ${goalMinutes % 60}m!`,
      });
    }

    // Check for inactive subjects (not studied in 5+ days)
    subjects.forEach(subject => {
      if (subject.chapters.length === 0) return;
      
      const lastStudied = subject.chapters
        .map(c => c.lastStudiedAt ? new Date(c.lastStudiedAt).getTime() : 0)
        .reduce((max, time) => Math.max(max, time), 0);
      
      if (lastStudied > 0) {
        const daysSinceStudy = Math.floor((today.getTime() - lastStudied) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStudy >= 5) {
          insights.push({
            type: 'inactive',
            icon: '⏰',
            title: 'Subject Needs Attention',
            message: `${subject.name} hasn't been studied in ${daysSinceStudy} days`,
          });
        }
      }
    });

    // Check for study streak
    if (studyStreak >= 3) {
      insights.push({
        type: 'success',
        icon: '🔥',
        title: 'Study Streak Active',
        message: `You're on a ${studyStreak}-day study streak!`,
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-red-500/30 bg-red-500/5';
      case 'goal':
        return 'border-[#2d9ca8]/30 bg-[#2d9ca8]/5';
      case 'inactive':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5';
      default:
        return 'border-white/8 bg-[#26292b]';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-[#e8e8e8] flex items-center gap-2">
        <span className="text-xl">📋</span>
        Quick Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getInsightStyle(insight.type)}`}
            style={{ 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#e8e8e8] mb-1">
                  {insight.title}
                </h4>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityInsights;
