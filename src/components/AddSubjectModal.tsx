import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Priority, SubjectColor, Subject } from '../types';

interface Props {
  onClose: () => void;
  editSubject?: Subject; // Optional: if provided, we're in edit mode
}

const AddSubjectModal: React.FC<Props> = ({ onClose, editSubject }) => {
  const { addSubject, updateSubject } = useApp();
  const { showToast } = useToast();
  const isEditMode = !!editSubject;
  
  const [name, setName] = useState(editSubject?.name || '');
  const [examDate, setExamDate] = useState(editSubject?.examDate || '');
  const [totalChapters, setTotalChapters] = useState(editSubject?.totalChapters || 10);
  const [priority, setPriority] = useState<Priority>(editSubject?.priority || Priority.Medium);
  const [color, setColor] = useState<SubjectColor>(editSubject?.color || SubjectColor.Blue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus first input when modal opens
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !examDate || isSubmitting) return;

    setIsSubmitting(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    if (isEditMode && editSubject) {
      // Update existing subject
      updateSubject(editSubject.id, {
        name,
        examDate,
        totalChapters,
        priority,
        color,
      });
      showToast(`${name} updated successfully! ✅`, 'success');
    } else {
      // Add new subject
      addSubject({
        name,
        examDate,
        totalChapters,
        priority,
        color,
      });
      showToast(`${name} added successfully! 🎉`, 'success');
    }

    onClose();
  };

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isFormValid = name.trim() && examDate;

  return (
    <div 
      className="fixed inset-0 bg-[#1a1d1e]/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      style={{ padding: '32px' }}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-h-[85vh] overflow-y-auto scroll-smooth"
        style={{ 
          maxWidth: '480px',
          background: '#26292b',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'modal-enter 250ms ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center transition-all group"
          style={{ 
            top: '24px', 
            right: '24px', 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px',
            background: 'transparent',
            transition: 'all 150ms ease-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 text-[#a0a0a0] group-hover:text-[#e8e8e8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div style={{ marginBottom: '24px', paddingRight: '32px' }}>
          <h2 className="text-[#e8e8e8]" style={{ fontSize: '20px', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: 600, marginBottom: '8px' }}>
            {isEditMode ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <p className="text-[#a0a0a0]" style={{ fontSize: '14px', fontWeight: 400 }}>
            {isEditMode ? 'Update subject details' : 'Create a new subject to track your exam preparation'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span className="flex items-center text-[#d0d0d0]" style={{ gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Subject Name
              </span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Data Structures & Algorithms"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span className="flex items-center text-[#d0d0d0]" style={{ gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <svg className="w-4 h-4 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Exam Date
              </span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="input"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span className="flex items-center text-[#d0d0d0]" style={{ gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Total Chapters
              </span>
            </label>
            <input
              type="number"
              value={totalChapters}
              onChange={(e) => setTotalChapters(parseInt(e.target.value))}
              className="input"
              min="1"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span className="flex items-center text-[#d0d0d0]" style={{ gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Priority
              </span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input"
              style={{ cursor: 'pointer' }}
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span className="flex items-center text-[#d0d0d0]" style={{ gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <svg className="w-4 h-4 text-[#2d9ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Color Theme
              </span>
            </label>
            <div className="flex gap-2 flex-wrap p-3 bg-[#1a1d1e]/50 rounded-lg border border-white/8">
              {Object.values(SubjectColor).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl border-2 border-white/12 transition-all duration-200 hover:scale-110 ${
                    color === c ? 'ring-2 ring-[#2d9ca8] ring-offset-2 ring-offset-[#1a1d1e] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex" style={{ gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={!isFormValid || isSubmitting}
              style={{
                position: 'relative',
                transition: 'all 150ms ease-out'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && isFormValid) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center" style={{ gap: '8px' }}>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                <span className="flex items-center justify-center" style={{ gap: '8px' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditMode ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                  </svg>
                  {isEditMode ? 'Save Changes' : 'Add Subject'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubjectModal;
