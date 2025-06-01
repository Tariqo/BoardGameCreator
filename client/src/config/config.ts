const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  apiUrl: isDevelopment 
    ? 'http://localhost:5000'
    : 'https://boardgamecreator.onrender.com',
  defaultFetchOptions: {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
};

export default config; 