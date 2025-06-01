import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';

interface ClientInfo {
  userId: string;
  username: string;
  sessionId: string;
  socket: WebSocket;
}

const clients: ClientInfo[] = [];

function parseCookies(cookieHeader: string | undefined) {
  const cookies: { [key: string]: string } = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const value = parts[1]?.trim();
    if (name && value) cookies[name] = value;
  });

  return cookies;
}

export const setupWebSocket = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    try {
      const params = new URLSearchParams(req.url?.split('?')[1] || '');
      const sessionId = params.get('sessionId');
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies['token'];

      if (!token) {
        console.error('❌ No auth token found in cookies');
        return socket.close();
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('❌ JWT_SECRET not configured');
        return socket.close();
      }

      const payload = jwt.verify(token, jwtSecret) as {
        userId: string;
        username: string;
      };

      const client: ClientInfo = {
        userId: payload.userId,
        username: payload.username,
        sessionId: sessionId || 'global',
        socket,
      };

      clients.push(client);
      console.log(`✅ WebSocket client connected: ${payload.username} (session: ${client.sessionId})`);

      sendOnlineUsers();

      socket.on('message', (data: string) => {
        try {
        const message = JSON.parse(data.toString());
        handleMessage(client, message);
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err);
        }
      });

      socket.on('close', () => {
        const index = clients.indexOf(client);
        if (index !== -1) clients.splice(index, 1);
        sendOnlineUsers();
      });

    } catch (err) {
      console.error('❌ WebSocket connection error:', err);
      socket.close();
    }
  });

  function handleMessage(sender: ClientInfo, message: any) {
    if (message.type === 'invite') {
      const target = clients.find(c => c.username === message.toUsername);
      if (target) {
        target.socket.send(
          JSON.stringify({
            type: 'invitation',
            from: sender.username,
            sessionId: message.sessionId || sender.sessionId,
          })
        );
      }
    }

    if (message.type === 'gameUpdate') {
      clients
        .filter(c => c.sessionId === sender.sessionId && c.userId !== sender.userId)
        .forEach(c => c.socket.send(JSON.stringify(message)));
    }
  }

  function sendOnlineUsers() {
    const usersBySession: Record<string, string[]> = {};

    for (const client of clients) {
      if (!usersBySession[client.sessionId]) {
        usersBySession[client.sessionId] = [];
      }
      if (!usersBySession[client.sessionId].includes(client.username)) {
        usersBySession[client.sessionId].push(client.username);
      }
    }

    for (const client of clients) {
      const users = usersBySession[client.sessionId] || [];
      client.socket.send(
        JSON.stringify({
          type: 'online_users',
          users,
        })
      );
    }
  }
};

export const sendToSession = (sessionId: string, message: any) => {
  clients
    .filter(c => c.sessionId === sessionId)
    .forEach(c => c.socket.send(JSON.stringify(message)));
};
