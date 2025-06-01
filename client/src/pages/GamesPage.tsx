import React, { useEffect, useState } from 'react';
import GamesTopbar from '../components/Layout/GamesTopbar';
import GamesSidebar from '../components/Layout/GamesSidebar';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import { trackGamePageView, trackGameStart } from '../utils/analytics';

interface Game {
  _id: string;
  name: string;
  createdAt: string;
  tags?: string[];
  description?: string;
  createdBy?: {
    username: string;
  };
}

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all games
    fetch(`${config.apiUrl}/api/games/search`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGames(data.data);
          setFilteredGames(data.data);
        } else {
          setError(data.message || 'Failed to fetch games');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Track game views when filtered games change
  useEffect(() => {
    filteredGames.forEach(game => {
      trackGamePageView(game._id, game.name);
    });
  }, [filteredGames]);

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
        (game.tags || []).some((tag) => tag.toLowerCase().includes(lowerSearch)) ||
        game.createdBy?.username.toLowerCase().includes(lowerSearch)
    );

    setFilteredGames(finalFiltered);
  }, [search, activeTag, games]);

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  const handleStartGame = async (gameId: string) => {
    try {
      const game = games.find(g => g._id === gameId);
      if (game) {
        trackGameStart(gameId, game.name);
      }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GamesTopbar search={search} setSearch={setSearch} />

      <div className="flex flex-1">
        <GamesSidebar onTagClick={handleTagClick} />

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {activeTag ? `Games tagged with "${activeTag}"` : 'Available Games'}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game._id}
                className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                onClick={() => handleStartGame(game._id)}
              >
                <div className="h-36 bg-gray-200 rounded-t-md flex items-center justify-center text-gray-400 text-sm">
                  Game Preview
                </div>
                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-medium text-gray-900">{game.name}</h2>
                  {game.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
                  )}
                  {game.createdBy && (
                    <p className="text-xs text-gray-500">Created by {game.createdBy.username}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {game.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="mt-10 text-center text-gray-400 text-sm">
              {activeTag
                ? `No games found with tag "${activeTag}"`
                : search
                ? 'No games match your search'
                : 'No games available. Be the first to publish one!'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GamesPage;
