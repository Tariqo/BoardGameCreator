import React from 'react';
import GamesTopbar from '../components/Layout/GamesTopbar';
import GamesSidebar from '../components/Layout/GamesSidebar';
import { useNavigate } from 'react-router-dom';

const GamesPage: React.FC = () => {
  const navigate = useNavigate();

  const mockGames = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    title: `Community Game ${i + 1}`,
    description: 'A fun and creative board game made by users.',
    createdAt: `${i + 1}h ago`,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GamesTopbar />

      <div className="flex flex-1">
        <GamesSidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Popular Community Games</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGames.map((game) => (
              <div
                key={game.id}
                className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="h-36 bg-gray-200 rounded-t-md flex items-center justify-center text-gray-400 text-sm">
                  Thumbnail
                </div>
                <div className="p-4 space-y-1">
                  <h2 className="text-lg font-medium text-gray-900">{game.title}</h2>
                  <p className="text-gray-500 text-sm">{game.description}</p>
                  <p className="text-gray-400 text-xs">{game.createdAt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-gray-400 text-sm">
            Scroll down to discover more games...
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamesPage;
