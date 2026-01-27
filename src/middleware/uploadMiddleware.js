import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'public/uploads/products/');
    },
    filename(req, file, cb) {
        cb(null, `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError('Format file tidak didukung! Gunakan jpg, png, atau webp.', 400));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter
});

export const uploadMultipleImages = upload.array('images', 10);
export default upload;