import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import EditorPage from './pages/EditorPage';
import GamesPage from './pages/GamesPage';
import PlayPage from './pages/PlayPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { startUserSession, endUserSession, trackUserPresence } from './utils/analytics';

const TrackLastPath: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!['/login', '/signup'].includes(location.pathname)) {
      sessionStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);

  return null;
};

const AppRoutes: React.FC = () => {
  const [search, setSearch] = useState('');
  const location = useLocation();

  // Track session duration
  useEffect(() => {
    const sessionStartTime = Date.now();
    startUserSession();
    trackUserPresence(true);

    const handleVisibilityChange = () => {
      trackUserPresence(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      endUserSession(duration);
      trackUserPresence(false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <TrackLastPath />
      <Routes>
        <Route path="/games" element={<GamesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage search={search} setSearch={setSearch} />
            </PrivateRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/session/:sessionId" element={<PlayPage />} />
        <Route path="*" element={<GamesPage />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
