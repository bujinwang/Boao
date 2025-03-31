// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select';
  required?: boolean;
  validation?: (value: any) => string | undefined;
  options?: Array<{ label: string; value: any }>;
}

// Date Types
export type DateFormat = 'short' | 'medium' | 'long' | 'full';
export type TimeFormat = '12h' | '24h';

// Currency Types
export interface Currency {
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimals: number;
}

// Image Types
export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'doctor';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
} 