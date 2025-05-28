import React, { useEffect, useState } from 'react';
import GamesTopbar from '../components/Layout/GamesTopbar';
import GamesSidebar from '../components/Layout/GamesSidebar';
import { useNavigate } from 'react-router-dom';

interface Game {
  _id: string;
  name: string;
  createdAt: string;
}

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/published/my', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user games:', err);
      });
  }, []);

  const handleStartGame = async (gameId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/game/session/start/${gameId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.sessionId) {
        navigate(`/play/session/${data.sessionId}`);
      } else {
        console.error('Failed to start session:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error starting game session:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GamesTopbar />

      <div className="flex flex-1">
        <GamesSidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Games</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game._id}
                className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                onClick={() => handleStartGame(game._id)}
              >
                <div className="h-36 bg-gray-200 rounded-t-md flex items-center justify-center text-gray-400 text-sm">
                  Thumbnail
                </div>
                <div className="p-4 space-y-1">
                  <h2 className="text-lg font-medium text-gray-900">{game.name}</h2>
                  <p className="text-gray-400 text-xs">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {games.length === 0 && (
            <div className="mt-10 text-center text-gray-400 text-sm">
              No games found. Try publishing one from the editor!
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GamesPage;
