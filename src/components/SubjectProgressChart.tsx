import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { subjectColorMap, barChartOptions, hexToRgba } from '../utils/chartConfig';

interface SubjectProgressChartProps {
  onSubjectClick?: (subjectId: string) => void;
}

const SubjectProgressChart: React.FC<SubjectProgressChartProps> = ({ onSubjectClick }) => {
  const { subjects } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

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
      // Prepare data
      const labels = subjects.map(s => s.name);
      const completedData = subjects.map(s => {
        if (s.chapters.length === 0) return 0;
        return s.chapters.filter(c => c.status === 'completed').length;
      });
      const inProgressData = subjects.map(s => {
        if (s.chapters.length === 0) return 0;
        return s.chapters.filter(c => c.status === 'in-progress').length;
      });
      const notStartedData = subjects.map(s => {
        if (s.chapters.length === 0) return 0;
        return s.chapters.filter(c => c.status === 'not-started').length;
      });

      // Create chart
      chartRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Completed',
              data: completedData,
              backgroundColor: hexToRgba('#22c55e', 0.8),
              borderColor: '#22c55e',
              borderWidth: 0,
            },
            {
              label: 'In Progress',
              data: inProgressData,
              backgroundColor: hexToRgba('#2d9ca8', 0.8),
              borderColor: '#2d9ca8',
              borderWidth: 0,
            },
            {
              label: 'Not Started',
              data: notStartedData,
              backgroundColor: hexToRgba('#64748b', 0.5),
              borderColor: '#64748b',
              borderWidth: 0,
            },
          ],
        },
        options: {
          ...barChartOptions,
          onClick: (event: any, activeElements: any[]) => {
            if (activeElements.length > 0 && onSubjectClick) {
              const index = activeElements[0].index;
              const subject = subjects[index];
              if (subject) {
                onSubjectClick(subject.id);
              }
            }
          },
          plugins: {
            ...barChartOptions.plugins,
            tooltip: {
              ...barChartOptions.plugins?.tooltip,
              callbacks: {
                title: (context: any) => {
                  return context[0].label;
                },
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.x;
                  return `${label}: ${value} chapter${value !== 1 ? 's' : ''}`;
                },
                afterLabel: (context: any) => {
                  const subjectIndex = context.dataIndex;
                  const subject = subjects[subjectIndex];
                  if (!subject) return '';
                  
                  const total = subject.chapters.length;
                  const completed = subject.chapters.filter(c => c.status === 'completed').length;
                  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return `Total: ${total} | Progress: ${percentage}%`;
                },
              },
            },
            legend: {
              ...barChartOptions.plugins?.legend,
              position: 'top',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating SubjectProgressChart:', error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [subjects, onSubjectClick]);

  if (subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#a0a0a0]">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">No subjects yet. Add a subject to see progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: Math.max(300, subjects.length * 60) }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default SubjectProgressChart;
