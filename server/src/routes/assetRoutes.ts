import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadToCloudinary } from '../controllers/assetController';

const router: Router = express.Router();

// Apply authentication middleware to all asset routes
router.use(authenticateToken);

// Upload an asset to Cloudinary
router.post('/upload', uploadToCloudinary);

export default router; 