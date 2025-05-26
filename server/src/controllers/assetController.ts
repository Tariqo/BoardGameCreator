// src/controllers/assetController.ts
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('📥 Incoming file upload request');

    if (!req.files || !req.files.sprite) {
      console.warn('⚠️ No file uploaded');
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const file = req.files.sprite as UploadedFile;

    console.log('🗂 File received:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempPath: file.tempFilePath,
    });

    console.log('☁️ Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'tabletop-studio',
      resource_type: 'auto',
    });

    console.log('✅ Upload successful:', result.secure_url);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const deleteFromCloudinary = async (req: Request, res: Response): Promise<void> => {
  const { publicId } = req.body;

  if (!publicId) {
    res.status(400).json({ success: false, message: 'Missing publicId' });
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    res.status(500).json({ success: false, message: 'Deletion failed' });
  }
};
