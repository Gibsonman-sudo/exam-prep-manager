import React from 'react';

interface Props {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<Props> = ({ progress, size = 48, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Get color based on progress
  const getProgressColor = (prog: number): string => {
    if (prog === 0) return '#ef4444';
    if (prog <= 25) return '#ef4444';
    if (prog <= 50) return '#f97316';
    if (prog <= 75) return '#eab308';
    if (prog < 100) return '#84cc16';
    return '#10b981';
  };

  const color = getProgressColor(progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 700ms ease-out, stroke 300ms ease-out'
          }}
        />
      </svg>
      {/* Percentage text */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
        style={{ color }}
      >
        {progress}%
      </div>
    </div>
  );
};

export default CircularProgress;
