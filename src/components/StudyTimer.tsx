import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/calculations';

const StudyTimer: React.FC = () => {
  const { currentSession, subjects, stopStudySession } = useApp();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!currentSession) {
      setElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      const start = new Date(currentSession.startTime).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 60000)); // minutes
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  if (!currentSession) return null;

  const subject = subjects.find(s => s.id === currentSession.subjectId);
  const topic = subject?.chapters
    .flatMap(c => c.topics)
    .find(t => t.id === currentSession.topicId);

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl border border-primary-500/50 bg-gradient-to-br from-primary-600 to-purple-600 p-6 shadow-2xl shadow-primary-500/30 min-w-[320px]">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 animate-pulse"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
              <span className="text-sm font-semibold text-white/90">Active Study Session</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className="text-5xl font-mono font-bold text-white mb-2 tracking-tight">
              {formatMinutes(elapsed)}
            </div>
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full animate-shimmer"></div>
            </div>
          </div>

          {/* Subject & Topic Info */}
          <div className="mb-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="text-sm font-semibold text-white mb-1">{subject?.name}</div>
            <div className="text-xs text-white/70">{topic?.name || 'Unknown topic'}</div>
          </div>

          {/* Stop Button */}
          <button
            onClick={() => stopStudySession()}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span>Stop Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
