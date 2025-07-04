const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  apiUrl: process.env.REACT_APP_API_URL || process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5000',
  defaultFetchOptions: {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
};

export default config; 