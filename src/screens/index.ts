import { lazy } from 'react';

// Auth Screens
export const LoginScreen = lazy(() => import('./auth/LoginScreen'));
export const RegisterScreen = lazy(() => import('./auth/RegisterScreen'));
export const ForgotPasswordScreen = lazy(() => import('./auth/ForgotPasswordScreen'));

// Main Screens
export const DashboardScreen = lazy(() => import('./main/DashboardScreen'));
export const ProfileScreen = lazy(() => import('./main/ProfileScreen'));
export const SettingsScreen = lazy(() => import('./main/SettingsScreen'));

// Feature Screens
export const BillingScreen = lazy(() => import('./billing/BillingScreen'));
export const BillingHistoryScreen = lazy(() => import('./billing/BillingHistoryScreen'));
export const BillingDetailsScreen = lazy(() => import('./billing/BillingDetailsScreen'));

export const OCRScreen = lazy(() => import('./ocr/OCRScreen'));
export const OCRHistoryScreen = lazy(() => import('./ocr/OCRHistoryScreen'));
export const OCRDetailsScreen = lazy(() => import('./ocr/OCRDetailsScreen')); 