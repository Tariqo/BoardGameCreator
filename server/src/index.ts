import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser'; 
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import assetRoutes from './routes/assetRoutes';
import gameLogicRoutes from './routes/gameLogicRoutes';
import gameRoutes from './routes/gameRoutes';
import publishedGameRoutes from './routes/publishedGameRoutes';
import gameSessionRoutes from './routes/gameSessionRoutes';

// ✅ Load .env variables
dotenv.config();

const app = express();

// ✅ Configure CORS with credentials
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser()); // ✅ Enable reading cookies
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// ✅ Serve uploaded sprite files
const spritesPath = path.join(__dirname, '../../uploads/sprites');
fs.mkdirSync(spritesPath, { recursive: true });
app.use('/sprites', express.static(spritesPath));

// ✅ Serve static files from uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/game-logic', gameLogicRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/published', publishedGameRoutes);
app.use('/api/game', gameSessionRoutes);

// ✅ Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabletop-studio';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
