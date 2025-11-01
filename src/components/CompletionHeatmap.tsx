import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface DayData {
  date: string;
  minutes: number;
  sessions: number;
  level: number; // 0-4 for intensity
}

const CompletionHeatmap: React.FC = () => {
  const { dailyLogs } = useApp();
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate last 90 days
  const generateDays = (): DayData[] => {
    const today = new Date();
    const days: DayData[] = [];

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.date === dateStr);
      
      const minutes = log?.totalMinutes || 0;
      const sessions = log?.sessions.length || 0;
      
      // Calculate intensity level (0-4)
      let level = 0;
      if (minutes > 0) {
        if (minutes >= 180) level = 4; // 3+ hours
        else if (minutes >= 120) level = 3; // 2-3 hours
        else if (minutes >= 60) level = 2; // 1-2 hours
        else level = 1; // <1 hour
      }

      days.push({ date: dateStr, minutes, sessions, level });
    }

    return days;
  };

  const days = generateDays();

  // Group days by week
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];
  
  // Pad the beginning with empty days to align with weekdays
  const firstDay = new Date(days[0].date).getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: '', minutes: 0, sessions: 0, level: -1 });
  }

  days.forEach((day, index) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7 || index === days.length - 1) {
      // Pad the end if needed
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', minutes: 0, sessions: 0, level: -1 });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getLevelColor = (level: number): string => {
    if (level === -1) return 'transparent'; // Empty cell
    if (level === 0) return 'rgba(100, 116, 139, 0.15)'; // No activity
    if (level === 1) return 'rgba(45, 156, 168, 0.3)';
    if (level === 2) return 'rgba(45, 156, 168, 0.5)';
    if (level === 3) return 'rgba(45, 156, 168, 0.75)';
    return 'rgba(45, 156, 168, 1)'; // level 4
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    if (day.date) {
      setHoveredDay(day);
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#e8e8e8]">Study Activity (Last 90 Days)</h3>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: getLevelColor(level),
                border: level === 0 ? '1px solid rgba(100, 116, 139, 0.3)' : 'none',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col justify-around pr-2">
            {['Mon', 'Wed', 'Fri'].map((day, i) => (
              <div key={day} className="text-xs text-[#a0a0a0] h-3 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-[#2d9ca8]/50"
                    style={{
                      backgroundColor: getLevelColor(day.level),
                      border: day.level === 0 ? '1px solid rgba(100, 116, 139, 0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex justify-between text-xs text-[#a0a0a0] px-8">
        {Array.from(new Set(days.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short' });
        }))).map((month, i) => (
          <span key={i}>{month}</span>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg shadow-xl pointer-events-none"
          style={{
            backgroundColor: '#2a2d2f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-xs font-semibold text-[#e8e8e8] mb-1">
            {formatDate(hoveredDay.date)}
          </div>
          <div className="text-xs text-[#a0a0a0]">
            {hoveredDay.minutes > 0 ? (
              <>
                <div>{Math.floor(hoveredDay.minutes / 60)}h {hoveredDay.minutes % 60}m studied</div>
                <div>{hoveredDay.sessions} session{hoveredDay.sessions !== 1 ? 's' : ''}</div>
              </>
            ) : (
              <div>No study activity</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionHeatmap;
