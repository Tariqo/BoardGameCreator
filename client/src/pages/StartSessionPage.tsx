import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';

const StartSessionPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const start = async () => {
      if (!user) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      try {
        const res = await fetch(`${config.apiUrl}/api/game/session/start/${gameId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to start game session');
        }

        const data = await res.json();
        if (data.sessionId) {
          navigate(`/play/session/${data.sessionId}`);
        } else {
          throw new Error('No session ID returned');
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        alert(error instanceof Error ? error.message : 'Failed to start game session');
        navigate('/games');
      }
    };

    if (!isLoading && gameId) {
      start();
    }
  }, [gameId, user, isLoading, navigate]);

  if (isLoading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return <div className="text-white p-8">Starting session...</div>;
};

export default StartSessionPage;
