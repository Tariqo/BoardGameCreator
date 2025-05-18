import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import GamesPage from './pages/GamesPage';
import ProfilePage from './pages/ProfilePage';
import { useLayout } from './store/layoutStore';

const App = () => {
  const { currentLayout } = useLayout();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
