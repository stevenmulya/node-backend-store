import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import ApiError from '../utils/ApiError.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'inventory-app/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new ApiError('Invalid file format. Only JPG, PNG, and WEBP are allowed.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 2 * 1024 * 1024,
        files: 10
    },
    fileFilter: fileFilter
});

export const uploadMultipleImages = (req, res, next) => {
    const uploadMiddleware = upload.array('images', 10);

    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new ApiError('File too large. Max size is 2MB.', 400));
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return next(new ApiError('Too many files. Max 10 images allowed.', 400));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new ApiError('Unexpected field name. Use "images".', 400));
            }
            return next(new ApiError(`Upload Error: ${err.message}`, 400));
        } else if (err) {
            return next(err);
        }
        next();
    });
};

export default upload;