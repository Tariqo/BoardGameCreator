// src/routes/assetRoutes.ts
import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadToCloudinary } from '../controllers/assetController';
import { v2 as cloudinary } from 'cloudinary';
import { deleteFromCloudinary } from '../controllers/assetController';
const router: Router = express.Router();

// Public test route for Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1024px-React-icon.svg.png',
            { folder: 'test' }
        );
        res.json({ success: true, url: result.secure_url });
    } catch (error: any) {
        console.error('Cloudinary test failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Authenticated image upload route
// router.use(authenticateToken);
router.post('/upload', uploadToCloudinary);
router.delete('/delete', authenticateToken, deleteFromCloudinary);

export default router;
