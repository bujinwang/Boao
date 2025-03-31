import { ApiResponse, ApiError } from './common';

// API Endpoints
export type ApiEndpoint = 
  | '/auth/login'
  | '/auth/register'
  | '/auth/forgot-password'
  | '/auth/reset-password'
  | '/users/profile'
  | '/users/update'
  | '/billing/list'
  | '/billing/create'
  | '/billing/update'
  | '/billing/delete'
  | '/ocr/process'
  | '/ocr/list'
  | '/ocr/delete';

// API Methods
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Request Options
export interface ApiRequestOptions {
  method: ApiMethod;
  endpoint: ApiEndpoint;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// API Request Function Type
export type ApiRequestFunction = <T>(
  options: ApiRequestOptions
) => Promise<ApiResponse<T>>;

// API Error Response
export interface ApiErrorResponse {
  error: ApiError;
  status: number;
}

// API Success Response
export interface ApiSuccessResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API Request Interceptor
export type ApiRequestInterceptor = (config: ApiRequestOptions) => ApiRequestOptions;

// API Response Interceptor
export type ApiResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T>;

// API Error Interceptor
export type ApiErrorInterceptor = (error: ApiErrorResponse) => Promise<never>;

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  requestInterceptors?: ApiRequestInterceptor[];
  responseInterceptors?: ApiResponseInterceptor[];
  errorInterceptors?: ApiErrorInterceptor[];
}

// API Client Instance
export interface ApiClient {
  request: ApiRequestFunction;
  get: <T>(endpoint: ApiEndpoint, params?: Record<string, any>) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: ApiEndpoint, data?: any) => Promise<ApiResponse<T>>;
  put: <T>(endpoint: ApiEndpoint, data?: any) => Promise<ApiResponse<T>>;
  delete: <T>(endpoint: ApiEndpoint) => Promise<ApiResponse<T>>;
  patch: <T>(endpoint: ApiEndpoint, data?: any) => Promise<ApiResponse<T>>;
} 