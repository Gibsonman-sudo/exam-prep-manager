import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { lineChartOptions, hexToRgba, chartColors } from '../utils/chartConfig';

type DayRange = 7 | 14 | 30;

const WeeklyTrendChart: React.FC = () => {
  const { dailyLogs, studyGoal } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [dayRange, setDayRange] = useState<DayRange>(7);

  useEffect(() => {
    // Check if Chart.js is loaded
    if (typeof window.Chart === 'undefined') {
      console.error('Chart.js library failed to load');
      return;
    }

    if (!canvasRef.current) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    try {
      // Generate last N days
      const today = new Date();
      const dates: string[] = [];
      for (let i = dayRange - 1; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Get minutes for each day
      const data = dates.map(date => {
        const log = dailyLogs.find(l => l.date === date);
        return log ? log.totalMinutes : 0;
      });

      // Format labels (e.g., "Mon 1" or "11/01")
      const labels = dates.map(date => {
        const d = new Date(date);
        if (dayRange === 7) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `${days[d.getDay()]} ${d.getDate()}`;
        } else {
          return `${d.getMonth() + 1}/${d.getDate()}`;
        }
      });

      // Goal line data (with safety check)
      const goalMinutes = studyGoal?.dailyMinutes || 120;
      const goalData = dates.map(() => goalMinutes);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, hexToRgba('#2d9ca8', 0.4));
    gradient.addColorStop(1, hexToRgba('#2d9ca8', 0.05));

    // Create chart
    chartRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Study Minutes',
            data,
            borderColor: '#2d9ca8',
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Daily Goal',
            data: goalData,
            borderColor: hexToRgba('#64748b', 0.5),
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
          },
        ],
      },
      options: {
        ...lineChartOptions,
        plugins: {
          ...lineChartOptions.plugins,
          tooltip: {
            ...lineChartOptions.plugins?.tooltip,
            callbacks: {
              label: (context: any) => {
                if (context.datasetIndex === 1) {
                  return `Goal: ${context.parsed.y} min`;
                }
                const value = context.parsed.y;
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `Studied: ${hours}h ${minutes}m`;
              },
              afterLabel: (context: any) => {
                if (context.datasetIndex === 0) {
                  const value = context.parsed.y;
                  const goal = studyGoal.dailyMinutes;
                  if (value >= goal) {
                    const extra = value - goal;
                    return `+${extra} min above goal!`;
                  } else if (value > 0) {
                    const deficit = goal - value;
                    return `${deficit} min below goal`;
                  }
                }
                return '';
              },
            },
          },
          legend: {
            ...lineChartOptions.plugins?.legend,
            display: true,
            position: 'top',
          },
        },
        scales: {
          ...lineChartOptions.scales,
          y: {
            ...lineChartOptions.scales?.y,
            ticks: {
              ...lineChartOptions.scales?.y?.ticks,
              callback: (value: any) => {
                const hours = Math.floor(value / 60);
                const mins = value % 60;
                return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
              },
            },
          },
        },
      },
    });
    } catch (error) {
      console.error('Error creating WeeklyTrendChart:', error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dailyLogs, studyGoal, dayRange]);

  return (
    <div className="space-y-4">
      {/* Day range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#e8e8e8]">Study Trend</h3>
        <div className="inline-flex rounded-lg bg-[#1a1d1e]/50 p-1" style={{ gap: '4px' }}>
          {([7, 14, 30] as DayRange[]).map(days => (
            <button
              key={days}
              onClick={() => setDayRange(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                dayRange === days
                  ? 'bg-[#2d9ca8] text-white shadow-sm'
                  : 'text-[#a0a0a0] hover:text-[#e8e8e8] hover:bg-[#26292b]/50'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: '300px' }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default WeeklyTrendChart;
