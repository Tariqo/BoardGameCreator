import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import EditorPage from './pages/EditorPage';
import GamesPage from './pages/GamesPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const TrackLastPath: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/login') {
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

      <Route path="*" element={<LoginPage />} />
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
