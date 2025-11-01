import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { subjectColorMap, donutChartOptions, hexToRgba } from '../utils/chartConfig';

type TimeView = 'week' | 'month' | 'all';

const StudyTimeDistribution: React.FC = () => {
  const { subjects, dailyLogs } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [timeView, setTimeView] = useState<TimeView>('week');

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
      // Calculate date range
      const today = new Date();
      let startDate: Date;
      
      switch (timeView) {
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = new Date(0);
          break;
      }

      // Calculate time per subject
    const subjectTimeMap = new Map<string, number>();
    subjects.forEach(s => subjectTimeMap.set(s.id, 0));

    dailyLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate >= startDate) {
        log.sessions.forEach(session => {
          const current = subjectTimeMap.get(session.subjectId) || 0;
          subjectTimeMap.set(session.subjectId, current + session.durationMinutes);
        });
      }
    });

    // Filter out subjects with 0 time
    const subjectsWithTime = subjects.filter(s => (subjectTimeMap.get(s.id) || 0) > 0);
    
    if (subjectsWithTime.length === 0) {
      return;
    }

    const labels = subjectsWithTime.map(s => s.name);
    const data = subjectsWithTime.map(s => subjectTimeMap.get(s.id) || 0);
    const colors = subjectsWithTime.map(s => subjectColorMap[s.color] || '#2d9ca8');

    const totalMinutes = data.reduce((sum, val) => sum + val, 0);

    // Create chart
    chartRef.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.map(c => hexToRgba(c, 0.8)),
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        ...donutChartOptions,
        plugins: {
          ...donutChartOptions.plugins,
          tooltip: {
            ...donutChartOptions.plugins?.tooltip,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed;
                const percentage = ((value / totalMinutes) * 100).toFixed(1);
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `${label}: ${hours}h ${minutes}m (${percentage}%)`;
              },
            },
          },
        },
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart: any) => {
          const { width, height, ctx } = chart;
          ctx.restore();
          
          const fontSizeNum = parseFloat((height / 200).toFixed(2));
          const fontSize = `${fontSizeNum}em`;
          ctx.font = `600 ${fontSize} Inter, sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#e8e8e8';
          
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const text = `${hours}h ${minutes}m`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 - 10;
          
          ctx.fillText(text, textX, textY);
          
          // Subtitle
          ctx.font = `400 ${fontSizeNum * 0.5}em Inter, sans-serif`;
          ctx.fillStyle = '#a0a0a0';
          let subtitle = '';
          switch (timeView) {
            case 'week':
              subtitle = 'This Week';
              break;
            case 'month':
              subtitle = 'This Month';
              break;
            case 'all':
              subtitle = 'All Time';
              break;
          }
          const subtitleX = Math.round((width - ctx.measureText(subtitle).width) / 2);
          const subtitleY = height / 2 + 15;
          ctx.fillText(subtitle, subtitleX, subtitleY);
          
          ctx.save();
        },
      }],
    });
    } catch (error) {
      console.error('Error creating StudyTimeDistribution chart:', error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [subjects, dailyLogs, timeView]);

  const hasData = subjects.some(s => {
    const today = new Date();
    let startDate: Date;
    
    switch (timeView) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    return dailyLogs.some(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && log.sessions.some(sess => sess.subjectId === s.id);
    });
  });

  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#e8e8e8]">Study Time Distribution</h3>
        <div className="inline-flex rounded-lg bg-[#1a1d1e]/50 p-1" style={{ gap: '4px' }}>
          {(['week', 'month', 'all'] as TimeView[]).map(view => (
            <button
              key={view}
              onClick={() => setTimeView(view)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                timeView === view
                  ? 'bg-[#2d9ca8] text-white shadow-sm'
                  : 'text-[#a0a0a0] hover:text-[#e8e8e8] hover:bg-[#26292b]/50'
              }`}
            >
              {view === 'week' ? 'Week' : view === 'month' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="relative" style={{ height: '300px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-[#a0a0a0]">
          <div className="text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">No study data for this time period.</p>
            <p className="text-xs mt-1">Start tracking your study sessions!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimeDistribution;
