import React, { useState } from 'react';
import { Subject, Status, Priority, Chapter } from '../types';
import { useApp } from '../context/AppContext';
import ChapterList from './ChapterList';
import AddChapterModal from './AddChapterModal';

interface Props {
  subject: Subject;
}

const SubjectDetail: React.FC<Props> = ({ subject }) => {
  const { addChapter } = useApp();
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  
  const daysUntilExam = Math.ceil((new Date(subject.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const completedChapters = subject.chapters.filter(c => c.status === Status.Completed).length;
  const progressPercent = Math.round((completedChapters / subject.totalChapters) * 100);

  const handleAddChapter = (newChapter: Omit<Chapter, 'id' | 'createdAt'>) => {
    // Remove topics from the object since addChapter expects it without topics
    const { topics, ...chapterWithoutTopics } = newChapter;
    addChapter(subject.id, chapterWithoutTopics);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="card-glass relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-12 rounded-full" style={{ backgroundColor: subject.color }}></div>
              <h2 className="text-3xl font-bold text-slate-100">{subject.name}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(subject.examDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                daysUntilExam < 0 ? 'bg-slate-700 text-slate-400' :
                daysUntilExam <= 7 ? 'bg-red-500/20 text-red-400' :
                daysUntilExam <= 30 ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {daysUntilExam < 0 ? 'Exam passed' : `${daysUntilExam} days left`}
              </span>
              <span className={`badge ${
                subject.priority === Priority.High ? 'badge-urgent' :
                subject.priority === Priority.Medium ? 'badge-warning' :
                'badge-info'
              }`}>
                {subject.priority} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Progress</span>
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-100">{progressPercent}%</div>
            <div className="progress-gradient mt-2">
              <div className="progress-gradient-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Chapters</span>
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-100">{completedChapters} / {subject.totalChapters}</div>
            <div className="text-xs text-slate-400 mt-1">Completed</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Topics</span>
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {subject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Across all chapters</div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="card">
        <h3 className="section-header mb-4">Chapters & Topics</h3>
        
        {subject.chapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-400 mb-2">No chapters added yet</p>
            <p className="text-sm text-slate-500 mb-6">Start by adding chapters to organize your study material</p>
            <button
              onClick={() => setShowAddChapterModal(true)}
              className="btn-primary"
            >
              Add Your First Chapter
            </button>
          </div>
        ) : (
          <ChapterList 
            subjectId={subject.id}
            chapters={subject.chapters}
          />
        )}
      </div>

      {/* Add Chapter Modal */}
      <AddChapterModal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        onAdd={handleAddChapter}
        existingChapters={subject.chapters}
      />
    </div>
  );
};

export default SubjectDetail;
