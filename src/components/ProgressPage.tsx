import React from 'react';
import { useApp } from '../context/AppContext';
import PriorityInsights from './PriorityInsights';
import SubjectProgressChart from './SubjectProgressChart';
import StudyTimeDistribution from './StudyTimeDistribution';
import WeeklyTrendChart from './WeeklyTrendChart';
import CompletionHeatmap from './CompletionHeatmap';
import ErrorBoundary from './ErrorBoundary';

interface ProgressPageProps {
  onSubjectClick?: (subjectId: string) => void;
  onClose?: () => void;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ onSubjectClick, onClose }) => {
  const { subjects, dailyLogs, studySessions } = useApp();

  const handleExportReport = () => {
    // Calculate summary data
    const totalStudyTime = dailyLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
    const totalSessions = studySessions.length;
    
    const subjectData = subjects.map(subject => {
      const subjectSessions = studySessions.filter(s => s.subjectId === subject.id);
      const subjectTime = subjectSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const completedChapters = subject.chapters.filter(c => c.status === 'completed').length;
      const totalChapters = subject.chapters.length;
      const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      return {
        name: subject.name,
        examDate: subject.examDate,
        progress,
        completedChapters,
        totalChapters,
        timeSpent: `${Math.floor(subjectTime / 60)}h ${subjectTime % 60}m`,
        sessions: subjectSessions.length,
      };
    });

    // Create CSV content
    const csvHeaders = ['Subject', 'Exam Date', 'Progress %', 'Chapters (Completed/Total)', 'Time Spent', 'Sessions'];
    const csvRows = subjectData.map(s => [
      s.name,
      s.examDate,
      `${s.progress}%`,
      `${s.completedChapters}/${s.totalChapters}`,
      s.timeSpent,
      s.sessions.toString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
      '',
      'SUMMARY',
      `Total Study Time,${Math.floor(totalStudyTime / 60)}h ${totalStudyTime % 60}m`,
      `Total Sessions,${totalSessions}`,
      `Subjects,${subjects.length}`,
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `study-progress-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#e8e8e8] mb-1">
            Progress & Analytics
          </h2>
          <p className="text-sm text-[#a0a0a0]">
            Visualize your study patterns and track your progress
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="btn-secondary"
              aria-label="Close progress page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mb-8">
        <ErrorBoundary fallback={
          <div className="card p-4 text-center text-sm text-[#a0a0a0]">
            Unable to load insights
          </div>
        }>
          <PriorityInsights />
        </ErrorBoundary>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Progress */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Chapter Completion by Subject
          </h3>
          <ErrorBoundary fallback={
            <div className="text-center text-sm text-[#a0a0a0] py-8">
              Unable to load chart
            </div>
          }>
            <SubjectProgressChart onSubjectClick={onSubjectClick} />
          </ErrorBoundary>
        </div>

        {/* Time Distribution */}
        <div className="card p-6">
          <ErrorBoundary fallback={
            <div className="text-center text-sm text-[#a0a0a0] py-8">
              Unable to load chart
            </div>
          }>
            <StudyTimeDistribution />
          </ErrorBoundary>
        </div>
      </div>

      {/* Trend Chart - Full Width */}
      <div className="card p-6 mb-6">
        <ErrorBoundary fallback={
          <div className="text-center text-sm text-[#a0a0a0] py-8">
            Unable to load chart
          </div>
        }>
          <WeeklyTrendChart />
        </ErrorBoundary>
      </div>

      {/* Heatmap - Full Width */}
      <div className="card p-6">
        <ErrorBoundary fallback={
          <div className="text-center text-sm text-[#a0a0a0] py-8">
            Unable to load heatmap
          </div>
        }>
          <CompletionHeatmap />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ProgressPage;
