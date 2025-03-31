// Validation Types
export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Formatting Types
export interface DateFormatOptions {
  format: 'short' | 'medium' | 'long' | 'full';
  locale?: string;
}

export interface NumberFormatOptions {
  style: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Storage Types
export interface StorageItem<T> {
  key: string;
  value: T;
  timestamp: number;
}

export interface StorageOptions {
  expiresIn?: number; // milliseconds
  prefix?: string;
}

// Cache Types
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl: number; // milliseconds
  maxSize?: number;
}

// Event Types
export interface EventEmitter {
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

// Logger Types
export interface LogLevel {
  debug: 0;
  info: 1;
  warn: 2;
  error: 3;
}

export interface LoggerOptions {
  level: keyof LogLevel;
  format?: 'json' | 'text';
  timestamp?: boolean;
}

// Error Handling Types
export interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Performance Types
export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memory?: {
    used: number;
    total: number;
  };
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
  iterations?: number;
}

// Device Types
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
  isTablet: boolean;
  isEmulator: boolean;
} 