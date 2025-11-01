import React, { useState } from 'react';
import StudyTimerModal from './StudyTimerModal';

const StudyTimerButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 group"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d9ca8 0%, #239aa5 100%)',
          boxShadow: '0 4px 12px rgba(45, 156, 168, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'all 200ms ease-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(45, 156, 168, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 156, 168, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)';
        }}
        aria-label="Open study timer"
      >
        <div className="flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
      </button>

      {/* Timer Modal */}
      {showModal && (
        <StudyTimerModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default StudyTimerButton;
