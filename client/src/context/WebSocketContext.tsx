import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  ReactNode,
  MutableRefObject,
} from 'react';
import { useAuth } from './AuthContext';
import config from '../config/config';

interface WebSocketContextType {
  wsRef: MutableRefObject<WebSocket | null>;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const connect = () => {
    if (!user) return;

    // Clean up existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const wsUrl = config.apiUrl.replace(/^http/, 'ws');
      const token = localStorage.getItem('wsToken'); // ✅ JWT stored during login
      const socket = new WebSocket(`${wsUrl}/?token=${token || ''}`);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('🟢 WebSocket connected');
        setIsConnected(true);

        // Optional: initial identification
        socket.send(
          JSON.stringify({
            type: 'auth',
            username: user.username,
          })
        );
      };

      socket.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        setIsConnected(false);
      };

      socket.onclose = () => {
        console.warn('🔌 WebSocket closed');
        setIsConnected(false);

        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }

        // Try to reconnect after 5s
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (user) {
            console.log('🔄 Attempting to reconnect WebSocket...');
            connect();
          }
        }, 5000);
      };
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ wsRef, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
