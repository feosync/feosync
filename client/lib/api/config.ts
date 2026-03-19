// API Configuration - toggle between real API and mock for testing
export const API_CONFIG = {
  // Use mock API for development/testing without a backend
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false',
  
  // API Base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Request timeout (ms)
  REQUEST_TIMEOUT: 30000,
  
  // Cache durations (ms)
  CACHE: {
    SHORT: 2 * 60 * 1000,    // 2 minutes
    MEDIUM: 5 * 60 * 1000,   // 5 minutes
    LONG: 10 * 60 * 1000,    // 10 minutes
  },
};

export function isUsingMockApi(): boolean {
  if (typeof window === 'undefined') {
    return API_CONFIG.USE_MOCK;
  }
  // Allow toggling via localStorage for development
  const override = localStorage.getItem('USE_MOCK_API');
  if (override !== null) {
    return override === 'true';
  }
  return API_CONFIG.USE_MOCK;
}
