import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // ✅ New import
import ProfilePage from './pages/ProfilePage';
import EditorPage from './pages/EditorPage';
import GamesPage from './pages/GamesPage';
import PlayPage from './pages/PlayPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const TrackLastPath: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!['/login', '/signup'].includes(location.pathname)) {
      sessionStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);

  return null;
};

const AppRoutes: React.FC = () => (
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
            <ProfilePage />
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
