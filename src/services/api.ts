export const API_BASE = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
  ? 'https://room-rental-management-adg.pages.dev'
  : '';

export const apiUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};
