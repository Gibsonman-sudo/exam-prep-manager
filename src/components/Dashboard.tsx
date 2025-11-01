import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateOverallProgress,
  calculateSubjectProgress,
  daysUntilExam,
  formatMinutes,
  suggestNextSubject,
  isOverdue,
} from '../utils/calculations';
import { Status } from '../types';
import PriorityInsights from './PriorityInsights';
import { useToast } from '../context/ToastContext';
import GoalCelebration from './GoalCelebration';

const Dashboard: React.FC = () => {
  const { subjects, dailyLogs, studyStreak, studyGoal } = useApp();
  const { showToast } = useToast();
  const [hasShownGoalCelebration, setHasShownGoalCelebration] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const overallProgress = calculateOverallProgress(subjects);

  // Calculate today and week stats
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find(log => log.date === today);
  const todayMinutes = todayLog?.totalMinutes || 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekMinutes = dailyLogs
    .filter(log => new Date(log.date) >= oneWeekAgo)
    .reduce((sum, log) => sum + log.totalMinutes, 0);

  // Safe access to studyGoal with fallback
  const safeStudyGoal = studyGoal || { dailyMinutes: 120, weeklyMinutes: 600 };

  // Calculate daily goal progress with error handling
  const dailyGoalProgress = safeStudyGoal.dailyMinutes > 0 
    ? Math.min((todayMinutes / safeStudyGoal.dailyMinutes) * 100, 100) 
    : 0;
  const dailyGoalReached = todayMinutes >= safeStudyGoal.dailyMinutes;

  // Calculate goal streak (consecutive days hitting daily goal)
  const calculateGoalStreak = () => {
    try {
      let streak = 0;
      const checkDate = new Date();
      let maxIterations = 365; // Safety limit
      
      while (maxIterations > 0) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const log = dailyLogs.find(l => l.date === dateStr);
        
        if (log && log.totalMinutes >= safeStudyGoal.dailyMinutes) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dateStr === today && todayMinutes >= safeStudyGoal.dailyMinutes) {
          // Today counts even if log isn't saved yet
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
        maxIterations--;
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating goal streak:', error);
      return 0;
    }
  };

  const goalStreak = calculateGoalStreak();

  // Show celebration when goal is reached (only once per day)
  useEffect(() => {
    try {
      if (dailyGoalReached && !hasShownGoalCelebration) {
        const celebrationShownKey = `goal-celebration-${today}`;
        const alreadyShown = sessionStorage.getItem(celebrationShownKey);
        
        if (!alreadyShown) {
          setShowCelebration(true);
          sessionStorage.setItem(celebrationShownKey, 'true');
          setHasShownGoalCelebration(true);
        }
      }
    } catch (error) {
      console.error('Error showing celebration:', error);
    }
  }, [dailyGoalReached, hasShownGoalCelebration, today]);

  // Get upcoming deadlines
  const upcomingDeadlines = subjects.flatMap(subject =>
    subject.chapters
      .filter(ch => ch.deadline && !isOverdue(ch.deadline) && ch.status !== Status.Completed)
      .map(ch => ({
        subjectName: subject.name,
        chapterName: ch.name,
        deadline: ch.deadline!,
        daysLeft: daysUntilExam(ch.deadline!),
      }))
  ).sort((a, b) => a.daysLeft - b.daysLeft);

  // Get overdue items
  const overdueItems = subjects.flatMap(subject =>
    subject.chapters
      .filter(ch => ch.deadline && isOverdue(ch.deadline) && ch.status !== Status.Completed)
      .map(ch => ({
        subjectName: subject.name,
        chapterName: ch.name,
        deadline: ch.deadline!,
      }))
  );

  // Get subjects with <7 days and <10% progress
  const urgentSubjects = subjects
    .filter(s => {
      const days = daysUntilExam(s.examDate);
      const progress = calculateSubjectProgress(s);
      return days <= 7 && days > 0 && progress < 10;
    });

  // Suggest next subject
  const suggested = suggestNextSubject(subjects);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '48px' }}>
      {/* Goal Celebration */}
      <GoalCelebration
        show={showCelebration}
        message={goalStreak > 1 ? `${goalStreak} days in a row! 🚀` : "Keep up the great work!"}
        onClose={() => setShowCelebration(false)}
      />

      {/* Hero Section with Welcome */}
      <div className="relative">
        <div className="relative card-glass border-2 border-slate-800/50" style={{ padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            lineHeight: '1.2', 
            letterSpacing: '-0.01em', 
            fontWeight: 600, 
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #e8e8e8 0%, #2d9ca8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back! 👋
          </h2>
          <p className="text-slate-400" style={{ fontSize: '14px' }}>Track your progress and ace your exams</p>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
        {/* Overall Progress */}
        <div 
          className="stat-card group hover:scale-105 transition-transform duration-200"
          style={{ 
            background: 'linear-gradient(135deg, rgba(45,156,168,0.1) 0%, rgba(45,156,168,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="stat-label">Overall Progress</div>
            <div 
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform" 
              style={{ 
                borderRadius: '6px',
                background: 'rgba(45,156,168,0.15)'
              }}
            >
              <svg className="w-5 h-5 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-value" style={{ marginBottom: '12px' }}>{overallProgress.toFixed(0)}%</div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill progress-gradient"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Study Streak */}
        <div 
          className="stat-card group hover:scale-105 transition-transform duration-200"
          style={{ 
            background: 'linear-gradient(135deg, rgba(244,114,93,0.1) 0%, rgba(244,114,93,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="stat-label">Study Streak</div>
            <div 
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform" 
              style={{ 
                borderRadius: '6px',
                background: 'rgba(244,114,93,0.15)'
              }}
            >
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <div className="stat-value">{studyStreak}</div>
          <div className="text-slate-500 font-medium" style={{ fontSize: '12px', marginTop: '8px' }}>
            {studyStreak > 0 ? 'Keep the momentum going!' : 'Start your streak today'}
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div 
          className="stat-card group hover:scale-105 transition-transform duration-200"
          style={{ 
            background: dailyGoalReached 
              ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)',
            border: dailyGoalReached 
              ? '1px solid rgba(16,185,129,0.3)'
              : '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="stat-label">Daily Goal</div>
            <div 
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform" 
              style={{ 
                borderRadius: '6px',
                background: dailyGoalReached ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'
              }}
            >
              {dailyGoalReached ? (
                <span className="text-2xl">🎯</span>
              ) : (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2" style={{ marginBottom: '12px' }}>
            <div className={dailyGoalReached ? "text-emerald-400" : "text-emerald-400"} style={{ fontSize: '24px', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: 600 }}>
              {formatMinutes(todayMinutes)}
            </div>
            <div className="text-slate-500" style={{ fontSize: '14px' }}>
              / {formatMinutes(safeStudyGoal.dailyMinutes)}
            </div>
          </div>
          <div className="progress-bar h-3" style={{ marginBottom: '8px' }}>
            <div
              className={dailyGoalReached ? "progress-fill bg-gradient-to-r from-emerald-500 to-green-400" : "progress-fill progress-gradient"}
              style={{ width: `${dailyGoalProgress}%` }}
            />
          </div>
          <div className="text-slate-500 font-medium" style={{ fontSize: '12px' }}>
            {dailyGoalReached ? '✅ Goal reached!' : `${Math.round(dailyGoalProgress)}% complete`}
          </div>
          {goalStreak > 1 && (
            <div className="mt-2 flex items-center gap-1 text-amber-400" style={{ fontSize: '11px', fontWeight: 600 }}>
              <span>🔥</span>
              <span>{goalStreak} days hitting your goal!</span>
            </div>
          )}
        </div>

        {/* This Week */}
        <div 
          className="stat-card group hover:scale-105 transition-transform duration-200"
          style={{ 
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="stat-label">This Week</div>
            <div 
              className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform" 
              style={{ 
                borderRadius: '6px',
                background: 'rgba(139,92,246,0.15)'
              }}
            >
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-purple-400" style={{ fontSize: '24px', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: 600 }}>{formatMinutes(weekMinutes)}</div>
          <div className="text-slate-500 font-medium" style={{ fontSize: '12px', marginTop: '8px' }}>Total hours</div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentSubjects.length > 0 && (
        <div className="relative overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-red-950/40 to-red-900/20 backdrop-blur-sm animate-pulse-slow" style={{ borderRadius: '12px', padding: '24px' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center mb-4" style={{ gap: '12px' }}>
              <div className="w-12 h-12 bg-red-500/20 flex items-center justify-center" style={{ borderRadius: '8px' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-400" style={{ fontSize: '20px', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: 600 }}>Urgent Alert!</h3>
                <p className="text-red-300/80" style={{ fontSize: '14px' }}>Exams approaching with low progress</p>
              </div>
            </div>
            <ul className="space-y-3">
              {urgentSubjects.map(s => (
                <li key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-red-950/40 border border-red-900/50">
                  <div>
                    <div className="font-semibold text-red-200">{s.name}</div>
                    <div className="text-sm text-red-300/70">{daysUntilExam(s.examDate)} days left</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">{calculateSubjectProgress(s).toFixed(0)}%</div>
                    <div className="text-xs text-red-400/70">Complete</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Study This Next - Premium Card */}
      {suggested && (
        <div className="relative overflow-hidden rounded-2xl border border-primary-500/50 bg-gradient-to-br from-primary-950/40 to-purple-950/40 backdrop-blur-sm p-6 hover:scale-[1.02] transition-transform duration-200 shine">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    Study This Next
                  </h3>
                  <p className="text-sm text-slate-400">AI recommended</p>
                </div>
              </div>
              <span className="text-4xl floating">📖</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-100 mb-2">{suggested.name}</div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className={`flex items-center gap-1 ${daysUntilExam(suggested.examDate) <= 7 ? 'text-red-400 font-semibold' : ''}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {daysUntilExam(suggested.examDate)} days until exam
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {calculateSubjectProgress(suggested).toFixed(0)}% complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines & Overdue - Modern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Items */}
        {overdueItems.length > 0 && (
          <div className="card border-red-500/30 bg-red-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-xl">🚨</span>
              </div>
              <h3 className="text-lg font-bold text-red-400">Overdue Items</h3>
            </div>
            <ul className="space-y-3">
              {overdueItems.slice(0, 5).map((item, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-red-950/30 border border-red-900/30 hover:border-red-800/50 transition-colors">
                  <div className="font-medium text-red-200">{item.subjectName}</div>
                  <div className="text-sm text-red-300/70 mt-1">{item.chapterName}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="card border-amber-500/30 bg-amber-950/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-amber-400">Upcoming Deadlines</h3>
            </div>
            <ul className="space-y-3">
              {upcomingDeadlines.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">{item.subjectName}</div>
                    <div className="text-sm text-slate-400 mt-1">{item.chapterName}</div>
                  </div>
                  <span className={`badge ${item.daysLeft <= 3 ? 'bg-red-600/80 text-red-100 border-red-500/50' : 'bg-slate-800/80 text-slate-300 border-slate-700/50'}`}>
                    {item.daysLeft} days
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Priority Insights */}
      {subjects.length > 0 && (
        <div>
          <PriorityInsights />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
