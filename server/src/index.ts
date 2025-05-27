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
import { errorHandler } from './middleware/errorHandler';
import gameRoutes from './routes/gameRoutes';
import publishedGameRoutes from './routes/publishedGameRoutes';
import gameSessionRoutes from './routes/gameSessionRoutes';

// ✅ Load .env variables
dotenv.config();

const app = express();

// ✅ CORS - allow cookies from frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser()); // ✅ Enable reading cookies
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 },
}));

// ✅ Serve uploaded sprite files
const spritesPath = path.join(__dirname, '../../uploads/sprites');
fs.mkdirSync(spritesPath, { recursive: true });
app.use('/sprites', express.static(spritesPath));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/game', gameLogicRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/published', publishedGameRoutes);

app.use('/api/game', gameSessionRoutes);

// ✅ Global Error Handler (always last)
app.use(errorHandler);

// ✅ Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabletop-studio';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
