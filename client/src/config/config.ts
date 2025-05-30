const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  defaultFetchOptions: {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

export default config; 