import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StudySession } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = 'timer' | 'manual';

const StudyTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { subjects, startStudySession, stopStudySession, currentSession, addManualSession } = useApp();
  
  // Timer state
  const [mode, setMode] = useState<TimerMode>('timer');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const intervalRef = useRef<number | null>(null);

  // Manual entry state
  const [manualSubjectId, setManualSubjectId] = useState('');
  const [manualChapterId, setManualChapterId] = useState('');
  const [manualDuration, setManualDuration] = useState({ hours: 0, minutes: 0 });
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualNotes, setManualNotes] = useState('');

  // Initialize from current session
  useEffect(() => {
    if (currentSession) {
      setSelectedSubjectId(currentSession.subjectId);
      setSelectedChapterId(currentSession.chapterId || '');
      const elapsed = Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 1000);
      setElapsedSeconds(elapsed);
      setIsRunning(true);
    }
  }, [currentSession]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Pomodoro notification (25 minutes)
  useEffect(() => {
    if (elapsedSeconds === 1500 && isRunning) { // 25 minutes
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🍅 Pomodoro Complete!', {
          body: 'You\'ve studied for 25 minutes. Time for a break!',
          icon: '/favicon.ico'
        });
      }
    }
  }, [elapsedSeconds, isRunning]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedSubjectId) {
      alert('Please select a subject first');
      return;
    }

    if (!currentSession) {
      startStudySession(selectedSubjectId, selectedChapterId || undefined);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (currentSession) {
      stopStudySession(sessionNotes);
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    setSessionNotes('');
    onClose();
  };

  const handleQuickAdd = (minutes: number) => {
    if (!selectedSubjectId) {
      alert('Please select a subject first');
      return;
    }

    const now = new Date();
    const session: Omit<StudySession, 'id'> = {
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId || undefined,
      startTime: new Date(now.getTime() - minutes * 60000).toISOString(),
      endTime: now.toISOString(),
      durationMinutes: minutes,
      date: now.toISOString().split('T')[0],
      notes: `Quick add: ${minutes} minutes`
    };

    addManualSession(session);
    alert(`Added ${minutes} minutes to your study time!`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualSubjectId) {
      alert('Please select a subject');
      return;
    }

    const totalMinutes = manualDuration.hours * 60 + manualDuration.minutes;
    if (totalMinutes <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    const now = new Date();
    const session: Omit<StudySession, 'id'> = {
      subjectId: manualSubjectId,
      chapterId: manualChapterId || undefined,
      startTime: new Date(manualDate).toISOString(),
      endTime: new Date(manualDate).toISOString(),
      durationMinutes: totalMinutes,
      date: manualDate,
      notes: manualNotes
    };

    addManualSession(session);
    
    // Reset form
    setManualSubjectId('');
    setManualChapterId('');
    setManualDuration({ hours: 0, minutes: 0 });
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualNotes('');
    setMode('timer');
    
    alert(`Logged ${totalMinutes} minutes of study time!`);
  };

  const selectedSubject = subjects.find(s => s.id === (mode === 'timer' ? selectedSubjectId : manualSubjectId));
  const chapters = selectedSubject?.chapters || [];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isRunning) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(26, 29, 30, 0.8)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #26292b 0%, #2a2d2f 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '32px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#e8e8e8]">
            {mode === 'timer' ? 'Study Timer' : 'Log Past Study Time'}
          </h2>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 hover:bg-white/5 rounded-lg transition-all duration-150 group disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-[#a0a0a0] group-hover:text-[#e8e8e8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('timer')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              mode === 'timer'
                ? 'bg-[#2d9ca8] text-white'
                : 'bg-white/5 text-[#a0a0a0] hover:bg-white/10'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setMode('manual')}
            disabled={isRunning}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 ${
              mode === 'manual'
                ? 'bg-[#2d9ca8] text-white'
                : 'bg-white/5 text-[#a0a0a0] hover:bg-white/10'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {mode === 'timer' ? (
          <>
            {/* Timer Display */}
            <div 
              className="text-center mb-6 py-8"
              style={{
                background: 'rgba(45, 156, 168, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(45, 156, 168, 0.2)'
              }}
            >
              <div
                className={`text-6xl font-mono font-bold text-[#2d9ca8] ${isRunning ? 'animate-pulse' : ''}`}
                style={{ letterSpacing: '0.05em' }}
              >
                {formatTime(elapsedSeconds)}
              </div>
              {selectedSubject && (
                <div className="mt-3 text-sm text-[#a0a0a0]">
                  Studying: <span className="text-[#e8e8e8] font-medium">{selectedSubject.name}</span>
                  {selectedChapterId && (
                    <span> - {chapters.find(c => c.id === selectedChapterId)?.name}</span>
                  )}
                </div>
              )}
            </div>

            {/* Subject & Chapter Selection */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId('');
                  }}
                  disabled={isRunning}
                  className="input"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubjectId && chapters.length > 0 && (
                <div>
                  <label className="label">Chapter (Optional)</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={isRunning}
                    className="input"
                  >
                    <option value="">No specific chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter.id} value={chapter.id}>
                        Chapter {chapter.number}: {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isRunning && (
                <div>
                  <label className="label">Session Notes (Optional)</label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="What are you studying? Any notes..."
                    className="input"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mb-6">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {currentSession ? 'Resume' : 'Start'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </button>
                  <button
                    onClick={handleStop}
                    className="btn-danger flex-1 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop
                  </button>
                </>
              )}
            </div>

            {/* Quick Add Buttons */}
            {!isRunning && (
              <div className="pt-6 border-t border-white/8">
                <p className="text-sm text-[#a0a0a0] mb-3">Quick add time (retroactive):</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickAdd(15)}
                    className="btn-secondary py-2 text-sm"
                  >
                    +15 min
                  </button>
                  <button
                    onClick={() => handleQuickAdd(30)}
                    className="btn-secondary py-2 text-sm"
                  >
                    +30 min
                  </button>
                  <button
                    onClick={() => handleQuickAdd(60)}
                    className="btn-secondary py-2 text-sm"
                  >
                    +1 hour
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Manual Entry Form */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="label">Subject *</label>
              <select
                value={manualSubjectId}
                onChange={(e) => {
                  setManualSubjectId(e.target.value);
                  setManualChapterId('');
                }}
                className="input"
                required
              >
                <option value="">Select a subject...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {manualSubjectId && chapters.length > 0 && (
              <div>
                <label className="label">Chapter (Optional)</label>
                <select
                  value={manualChapterId}
                  onChange={(e) => setManualChapterId(e.target.value)}
                  className="input"
                >
                  <option value="">No specific chapter</option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      Chapter {chapter.number}: {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={manualDuration.hours}
                  onChange={(e) => setManualDuration(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={manualDuration.minutes}
                  onChange={(e) => setManualDuration(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="What did you study?"
                className="input"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Log Study Time
              </button>
              <button
                type="button"
                onClick={() => setMode('timer')}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudyTimerModal;
