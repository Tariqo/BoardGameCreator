import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { corsMiddleware, optionsMiddleware } from './middleware/cors';
import { setupWebSocket } from './websocketServer';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import assetRoutes from './routes/assetRoutes';
import gameLogicRoutes from './routes/gameLogicRoutes';
import gameRoutes from './routes/gameRoutes';
import publishedGameRoutes from './routes/publishedGameRoutes';
import gameSessionRoutes from './routes/gameSessionRoutes';

// Load .env variables
dotenv.config();

const app = express();

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Apply CORS middleware
app.use(corsMiddleware);
app.use(optionsMiddleware);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Serve uploaded sprite files
const spritesPath = path.join(__dirname, '../../uploads/sprites');
fs.mkdirSync(spritesPath, { recursive: true });
app.use('/sprites', express.static(spritesPath));

// Serve static files from uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve static files from the React app
const clientBuildPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'client/build')
  : path.join(__dirname, '../../client/build');

if (fs.existsSync(clientBuildPath)) {
  console.log('✅ Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
} else {
  console.log('❌ Client build directory not found at:', clientBuildPath);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/game-logic', gameLogicRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/published', publishedGameRoutes);
app.use('/api/game', gameSessionRoutes);

// Handle React routing, return all requests to React app
app.get('/{*any}', (req, res, next) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/sprites/') || req.url.startsWith('/uploads/')) {
    next();
  } else {
    const indexPath = path.resolve(__dirname, '../client/build/index.html');

    if (fs.existsSync(indexPath)) {
      console.log('✅ Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found at:', indexPath);
      res.status(404).send(`Application not built. Please run npm run build in the client directory. Tried path: ${indexPath}`);
    }
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabletop-studio';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Create and start HTTP server with WebSocket support
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

setupWebSocket(server); // 👈 Attach WebSocket server

server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

export default app;
