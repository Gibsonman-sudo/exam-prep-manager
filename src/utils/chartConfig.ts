// Chart.js configuration and utilities for dark theme

import type { ChartOptions } from '../types/chart';

export const subjectColorMap: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
};

export const chartColors = {
  primary: '#2d9ca8',
  secondary: '#239aa5',
  background: '#26292b',
  surface: '#2a2d2f',
  text: '#e8e8e8',
  textMuted: '#a0a0a0',
  border: 'rgba(255, 255, 255, 0.08)',
  gridLines: 'rgba(255, 255, 255, 0.05)',
};

// Base chart options for dark theme consistency
export const baseChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: 'easeInOutQuart',
  },
  plugins: {
    legend: {
      labels: {
        color: chartColors.text,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
          weight: '500',
        },
        padding: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: chartColors.surface,
      titleColor: chartColors.text,
      bodyColor: chartColors.textMuted,
      borderColor: chartColors.border,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 13,
        weight: '600',
      },
      bodyFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 12,
        weight: '400',
      },
    },
  },
};

// Line chart specific options
export const lineChartOptions: Partial<ChartOptions<'line'>> = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        color: chartColors.gridLines,
        drawBorder: false,
      },
      ticks: {
        color: chartColors.textMuted,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: chartColors.gridLines,
        drawBorder: false,
      },
      ticks: {
        color: chartColors.textMuted,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
      beginAtZero: true,
    },
  },
};

// Bar chart specific options
export const barChartOptions: Partial<ChartOptions<'bar'>> = {
  ...baseChartOptions,
  indexAxis: 'y' as const,
  scales: {
    x: {
      stacked: true,
      grid: {
        color: chartColors.gridLines,
        drawBorder: false,
      },
      ticks: {
        color: chartColors.textMuted,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        color: chartColors.text,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
          weight: '500',
        },
      },
    },
  },
};

// Donut chart specific options
export const donutChartOptions: Partial<ChartOptions<'doughnut'>> = {
  ...baseChartOptions,
  cutout: '70%',
  plugins: {
    ...baseChartOptions.plugins,
    legend: {
      ...baseChartOptions.plugins?.legend,
      position: 'right' as const,
    },
  },
};

// Generate gradient for chart backgrounds
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  color1: string,
  color2: string,
  vertical = false
): CanvasGradient => {
  const gradient = vertical
    ? ctx.createLinearGradient(0, 0, 0, 400)
    : ctx.createLinearGradient(0, 0, 400, 0);
  
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  return gradient;
};

// Convert hex to rgba
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Get contrasting text color for background
export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#1a1d1e' : '#e8e8e8';
};
