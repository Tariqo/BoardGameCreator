import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config';

const StartSessionPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const start = async () => {
      const res = await fetch(`${config.apiUrl}/api/game/session/start/${gameId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.sessionId) {
        navigate(`/play/session/${data.sessionId}`);
      } else {
        alert('Failed to start game session');
      }
    };

    if (gameId) start();
  }, [gameId]);

  return <div className="text-white p-8">Starting session...</div>;
};

export default StartSessionPage;
