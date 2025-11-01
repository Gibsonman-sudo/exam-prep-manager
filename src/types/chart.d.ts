// Type declarations for Chart.js loaded via CDN

declare global {
  interface Window {
    Chart: any;
  }
}

export type ChartType = 'line' | 'bar' | 'doughnut' | 'pie' | 'radar';

export interface ChartOptions<T extends ChartType = ChartType> {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: {
    duration?: number;
    easing?: string;
  };
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      labels?: {
        color?: string;
        font?: {
          family?: string;
          size?: number;
          weight?: string | number;
        };
        padding?: number;
        usePointStyle?: boolean;
      };
    };
    tooltip?: {
      backgroundColor?: string;
      titleColor?: string;
      bodyColor?: string;
      borderColor?: string;
      borderWidth?: number;
      padding?: number;
      cornerRadius?: number;
      displayColors?: boolean;
      titleFont?: {
        family?: string;
        size?: number;
        weight?: string | number;
      };
      bodyFont?: {
        family?: string;
        size?: number;
        weight?: string | number;
      };
    };
  };
  scales?: {
    [key: string]: {
      stacked?: boolean;
      grid?: {
        display?: boolean;
        color?: string;
        drawBorder?: boolean;
      };
      ticks?: {
        color?: string;
        font?: {
          family?: string;
          size?: number;
          weight?: string | number;
        };
      };
      beginAtZero?: boolean;
    };
  };
  indexAxis?: 'x' | 'y';
  cutout?: string;
  onClick?: (event: any, activeElements: any[]) => void;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
}

export {};
