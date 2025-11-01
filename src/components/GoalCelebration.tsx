import React, { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  message: string;
  onClose: () => void;
}

const GoalCelebration: React.FC<Props> = ({ show, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div 
        className="card-glass border-2 border-emerald-500/50 shadow-2xl"
        style={{
          padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
          minWidth: '320px',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <span className="text-5xl">🔥</span>
            </div>
            <span className="text-5xl relative">🔥</span>
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-xl mb-1">
              Goal Reached!
            </div>
            <div className="text-slate-300 text-sm">
              {message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCelebration;
