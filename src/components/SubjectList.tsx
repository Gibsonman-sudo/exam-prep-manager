import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject, Priority, SubjectColor } from '../types';
import {
  calculateSubjectProgress,
  daysUntilExam,
  getSubjectColorClass,
  getPriorityColor,
} from '../utils/calculations';
import AddSubjectModal from './AddSubjectModal';
import CircularProgress from './CircularProgress';
import EmptyState from './EmptyState';
import DropdownMenu from './DropdownMenu';
import ConfirmModal from './ConfirmModal';
import BulkImportModal from './BulkImportModal';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

interface Props {
  onSelectSubject: (id: string) => void;
}

type SortBy = 'examDate' | 'priority' | 'progress';

const SubjectList: React.FC<Props> = ({ onSelectSubject }) => {
  const { subjects, deleteSubject } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('examDate');

  // Keyboard shortcut: N to add new subject
  useKeyboardShortcut('n', () => setShowAddModal(true));

  // Sort subjects
  const sortedSubjects = [...subjects].sort((a, b) => {
    switch (sortBy) {
      case 'examDate':
        return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
      case 'priority': {
        const priorityOrder: Record<Priority, number> = {
          [Priority.Critical]: 4,
          [Priority.High]: 3,
          [Priority.Medium]: 2,
          [Priority.Low]: 1,
        };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'progress':
        return calculateSubjectProgress(a) - calculateSubjectProgress(b);
      default:
        return 0;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header" style={{ marginBottom: '4px' }}>Your Subjects</h2>
          <p className="text-slate-400" style={{ fontSize: '14px' }}>Manage and track all your exam subjects</p>
        </div>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="input w-auto cursor-pointer"
            style={{ fontSize: '14px', padding: '12px 16px' }}
          >
            <option value="examDate">📅 Sort by Exam Date</option>
            <option value="priority">⚡ Sort by Priority</option>
            <option value="progress">📊 Sort by Progress</option>
          </select>
          <button 
            onClick={() => setShowBulkImportModal(true)} 
            className="btn-secondary inline-flex items-center" 
            style={{ gap: '8px' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Import
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center" style={{ gap: '8px' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subject
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="card" style={{ padding: '24px' }}>
          <EmptyState
            icon="📚"
            title="No subjects yet"
            description="Ready to ace your exams? Add your first subject and start tracking your progress today!"
            actionLabel="Add Your First Subject"
            onAction={() => setShowAddModal(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
          {sortedSubjects.map(subject => {
            const progress = calculateSubjectProgress(subject);
            const daysLeft = daysUntilExam(subject.examDate);
            const isUrgent = daysLeft <= 7 && daysLeft > 0 && progress < 10;

            return (
              <div
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSubject(subject.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${subject.name}. ${daysLeft} days until exam. ${progress.toFixed(0)}% complete.`}
                className={`subject-card group cursor-pointer ${
                  isUrgent ? 'ring-2 ring-red-500/50 shadow-glow' : ''
                } relative`}
              >
                {/* Color indicator stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSubjectColorClass(subject.color)} opacity-70 group-hover:opacity-100 transition-opacity`} aria-hidden="true" />
                
                {/* Three-dot menu - Top Right */}
                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu
                    items={[
                      {
                        label: 'Edit Subject',
                        icon: '✏️',
                        onClick: () => setEditingSubject(subject),
                      },
                      {
                        label: 'Delete Subject',
                        icon: '🗑️',
                        onClick: () => setDeletingSubject(subject),
                        danger: true,
                      },
                    ]}
                  />
                </div>

                {/* Priority Badge and Progress Circle */}
                <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getPriorityColor(subject.priority)}`} style={{ fontWeight: 600 }}>
                      {subject.priority.toUpperCase()}
                    </span>
                    {isUrgent && (
                        <span className="badge bg-red-600/80 text-red-100 border-red-500/50 animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    {/* Circular Progress - Inline with priority */}
                    <div className="flex-shrink-0" style={{ marginRight: '32px' }}>
                      <CircularProgress progress={Math.round(progress)} size={48} strokeWidth={4} />
                    </div>
                  </div>

                {/* Subject Name */}
                <h3 className="text-slate-100 group-hover:text-[#2d9ca8] transition-colors" style={{ fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: 600, marginBottom: '16px' }}>
                  {subject.name}
                </h3>

                {/* Stats Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div className="flex items-center justify-between" style={{ fontSize: '14px' }}>
                    <span className="text-slate-400 flex items-center" style={{ gap: '8px' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Exam Date
                    </span>
                    <span className={`${daysLeft <= 7 ? 'text-red-400' : 'text-slate-300'}`} style={{ fontWeight: 600 }}>
                      {new Date(subject.examDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between" style={{ fontSize: '14px' }}>
                    <span className="text-slate-400 flex items-center" style={{ gap: '8px' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Days Left
                    </span>
                    <span className={`${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-emerald-400'}`} style={{ fontWeight: 600, fontSize: '16px' }}>
                      {daysLeft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Chapters
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {subject.chapters.length}/{subject.totalChapters}
                    </span>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-5 pt-4 border-t border-slate-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-400">Overall Progress</span>
                    <span 
                      className={`text-sm font-bold ${
                        progress === 0 ? 'text-red-400' :
                        progress <= 25 ? 'text-orange-400' :
                        progress <= 50 ? 'text-amber-400' :
                        progress <= 75 ? 'text-lime-400' :
                        progress < 100 ? 'text-emerald-400' :
                        'text-green-400'
                      }`}
                    >
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className={`progress-fill ${
                        progress >= 80 ? 'progress-success' : progress >= 50 ? 'progress-gradient' : 'progress-warning'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {isUrgent && (
                  <div className="mt-4 p-2 rounded-lg bg-red-950/40 border border-red-900/50 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-xs text-red-300 font-medium">Low progress with exam approaching!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {!showAddModal && subjects.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-500">
            💡 Tip: Press <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50 text-slate-300 font-mono text-xs">N</kbd> to quickly add a new subject
          </p>
        </div>
      )}

      {showAddModal && <AddSubjectModal onClose={() => setShowAddModal(false)} />}
      {showBulkImportModal && <BulkImportModal onClose={() => setShowBulkImportModal(false)} />}
      {editingSubject && (
        <AddSubjectModal 
          editSubject={editingSubject}
          onClose={() => setEditingSubject(null)} 
        />
      )}
      {deletingSubject && (
        <ConfirmModal
          isOpen={true}
          title={`Delete "${deletingSubject.name}"?`}
          message="This will permanently delete this subject and all its associated chapters, topics, and study sessions."
          warning="This action cannot be undone. All your progress data for this subject will be lost."
          confirmText="Delete Subject"
          cancelText="Cancel"
          onConfirm={() => {
            deleteSubject(deletingSubject.id);
            setDeletingSubject(null);
          }}
          onCancel={() => setDeletingSubject(null)}
          danger={true}
        />
      )}
    </div>
  );
};

export default SubjectList;
