// src/pages/ProfilePage.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Game } from '../types/Game';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/Layout/ProfileLayout';

interface ProfilePageProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ search, setSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!user) return;

    fetch('http://localhost:5000/api/published/my', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch user games:', err));
  }, [user]);

  const filteredGames = games.filter((game) => {
    const lowerSearch = search.toLowerCase();
    return (
      game.name.toLowerCase().includes(lowerSearch) ||
      (game.tags || []).some((tag) => tag.toLowerCase().includes(lowerSearch))
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">You’re not logged in</h2>
          <p className="text-gray-500">
            Please <a href="/login" className="text-green-600 underline">sign in</a> to access your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      search={search}
      setSearch={setSearch}
      rightPanel={
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Saved Projects</h2>
          {games.length === 0 ? (
            <p className="text-gray-400">No saved projects found.</p>
          ) : (
            <ul className="space-y-3">
              {games.map((game) => (
                <li key={game._id} className="text-sm text-gray-700">
                  {game.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      }
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.username}</h1>
        <p className="text-gray-500 text-sm">Community profile</p>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4 text-gray-800">Your Games</h2>
        {filteredGames.length > 0 ? (
          <ul className="space-y-4">
            {filteredGames.map((game) => (
              <li key={game._id} className="flex gap-3 items-center">
                <div className="w-12 h-16 bg-gray-200 rounded-md shadow-inner flex items-center justify-center text-xs text-gray-500">
                  Img
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-800 font-medium">{game.name}</p>
                  <p className="text-gray-600">{(game.tags || []).join(', ')}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No games found. Try creating one!</p>
        )}
      </section>

      <div className="flex gap-4 mt-8">
        <button
          className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-5 py-2 rounded-lg shadow"
          onClick={() => navigate('/editor')}
        >
          Create New Game
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-5 py-2 rounded-lg shadow"
          onClick={() => navigate('/games')}
        >
          Explore Community
        </button>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
