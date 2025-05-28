import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StartSessionPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const start = async () => {
      const res = await fetch(`http://localhost:5000/api/game/session/start/${gameId}`, {
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
