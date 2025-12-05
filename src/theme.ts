export const lightTheme = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#E9ECEF',
  primary: '#3B82F6',
  secondary: '#EF4444',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#D1D5DB',
  xColor: '#3B82F6',
  oColor: '#EF4444',
  winLine: '#10B981',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  primary: '#60A5FA',
  secondary: '#F87171',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#475569',
  xColor: '#60A5FA',
  oColor: '#F87171',
  winLine: '#34D399',
  modalOverlay: 'rgba(0, 0, 0, 0.85)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;
