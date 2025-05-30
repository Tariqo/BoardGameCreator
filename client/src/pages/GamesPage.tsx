import React, { useEffect, useState } from 'react';
import GamesTopbar from '../components/Layout/GamesTopbar';
import GamesSidebar from '../components/Layout/GamesSidebar';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';

interface Game {
  _id: string;
  name: string;
  createdAt: string;
  tags?: string[];
}

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch(`${config.apiUrl}/api/published/my`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.data);
          setFilteredGames(data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user games:', err);
      });
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const byTag = activeTag
      ? games.filter((game) =>
          (game.tags || []).map((t) => t.toLowerCase()).includes(activeTag.toLowerCase())
        )
      : games;

    const finalFiltered = byTag.filter(
      (game) =>
        game.name.toLowerCase().includes(lowerSearch) ||
        (game.tags || []).some((tag) => tag.toLowerCase().includes(lowerSearch))
    );

    setFilteredGames(finalFiltered);
  }, [search, activeTag, games]);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  const handleStartGame = async (gameId: string) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/game/session/start/${gameId}`, {
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
      <GamesTopbar search={search} setSearch={setSearch} />

      <div className="flex flex-1">
        <GamesSidebar onTagClick={handleTagClick} />

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {activeTag ? `Games tagged with "${activeTag}"` : 'My Games'}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
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

          {filteredGames.length === 0 && (
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
