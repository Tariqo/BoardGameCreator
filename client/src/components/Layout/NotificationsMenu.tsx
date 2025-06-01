// src/components/Common/NotificationsMenu.tsx
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  from: string;
  sessionId: string;
}

interface Props {
  wsRef: React.MutableRefObject<WebSocket | null>;
}

const NotificationsMenu: React.FC<Props> = ({ wsRef }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    console.log('🔔 Setting up notification listener');

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', msg);
        
        if (msg.type === 'invitation') {
          console.log('📩 Received game invitation from:', msg.from);
          setNotifications(prev => [...prev, msg]);
        }
      } catch (err) {
        console.error('❌ Error handling WebSocket message:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      console.log('🧹 Cleaning up notification listener');
      ws.removeEventListener('message', handleMessage);
    };
  }, [wsRef]);

  const handleJoinGame = (sessionId: string) => {
    // Remove the notification when joining
    setNotifications(prev => prev.filter(n => n.sessionId !== sessionId));
    setOpen(false);
    navigate(`/play/session/${sessionId}`);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-gray-700 border border-gray-200 rounded shadow-lg z-30 p-2 text-sm">
          {notifications.length === 0 ? (
            <div className="p-2">No invitations</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-2 hover:bg-gray-50 rounded">
                <strong>{n.from}</strong> invited you to a game.
                <button 
                  onClick={() => handleJoinGame(n.sessionId)}
                  className="mt-1 w-full text-center text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Join Game
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
