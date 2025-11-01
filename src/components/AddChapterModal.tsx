import React, { useState, useEffect } from 'react';
import { Chapter, Status } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (chapter: Omit<Chapter, 'id' | 'createdAt'>) => void;
  existingChapters: Chapter[];
}

const AddChapterModal: React.FC<Props> = ({ isOpen, onClose, onAdd, existingChapters }) => {
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterName, setChapterName] = useState('');
  const [numberOfTopics, setNumberOfTopics] = useState(0);
  const [estimatedStudyTime, setEstimatedStudyTime] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ number?: string; name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-increment chapter number
  useEffect(() => {
    if (isOpen && existingChapters.length > 0) {
      const maxNumber = Math.max(...existingChapters.map(ch => ch.number));
      setChapterNumber(maxNumber + 1);
    } else if (isOpen) {
      setChapterNumber(1);
    }
  }, [isOpen, existingChapters]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setChapterName('');
      setNumberOfTopics(0);
      setEstimatedStudyTime('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: { number?: string; name?: string } = {};

    if (!chapterName.trim()) {
      newErrors.name = 'Chapter name is required';
    }

    // Check for duplicate chapter number
    if (existingChapters.some(ch => ch.number === chapterNumber)) {
      newErrors.number = 'Chapter number already exists';
    }

    if (chapterNumber < 1) {
      newErrors.number = 'Chapter number must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    const newChapter: Omit<Chapter, 'id' | 'createdAt'> = {
      number: chapterNumber,
      name: chapterName.trim(),
      topics: [],
      status: Status.NotStarted,
      estimatedStudyTime: estimatedStudyTime ? Number(estimatedStudyTime) : undefined,
      actualStudyTime: 0
    };

    onAdd(newChapter);
    setIsSubmitting(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-content animate-scale-in"
        style={{
          background: '#26292b',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#e8e8e8]">Add New Chapter</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-all duration-150 group"
            style={{ marginRight: '-8px' }}
          >
            <svg className="w-5 h-5 text-[#a0a0a0] group-hover:text-[#e8e8e8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Chapter Number */}
          <div>
            <label className="label flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Chapter Number
            </label>
            <input
              type="number"
              value={chapterNumber}
              onChange={(e) => {
                setChapterNumber(Number(e.target.value));
                setErrors({ ...errors, number: undefined });
              }}
              min="1"
              className={`input ${errors.number ? 'border-red-500' : ''}`}
              placeholder="1"
            />
            {errors.number && (
              <p className="text-red-400 text-xs mt-1">{errors.number}</p>
            )}
          </div>

          {/* Chapter Name */}
          <div>
            <label className="label flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Chapter Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => {
                setChapterName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Introduction to Calculus"
              autoFocus
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Number of Topics */}
          <div>
            <label className="label flex items-center gap-2">
              <svg className="w-4 h-4 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Number of Topics (optional)
            </label>
            <input
              type="number"
              value={numberOfTopics}
              onChange={(e) => setNumberOfTopics(Number(e.target.value))}
              min="0"
              className="input"
              placeholder="0"
            />
            <p className="text-xs text-[#6b6b6b] mt-1">You can add topics later</p>
          </div>

          {/* Estimated Study Time */}
          <div>
            <label className="label flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimated Study Time (hours)
            </label>
            <input
              type="number"
              value={estimatedStudyTime}
              onChange={(e) => setEstimatedStudyTime(e.target.value ? Number(e.target.value) : '')}
              min="0"
              step="0.5"
              className="input"
              placeholder="e.g., 5"
            />
            <p className="text-xs text-[#6b6b6b] mt-1">Optional: helps with planning</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Chapter
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapterModal;
