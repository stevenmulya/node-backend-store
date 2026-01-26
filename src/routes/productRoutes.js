import express from 'express';
import { body } from 'express-validator';
import { getProducts, createProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 * - name: Products
 * description: Product management
 */

/**
 * @swagger
 * /api/products:
 * get:
 * summary: Get all products
 * tags: [Products]
 * responses:
 * 200:
 * description: List of products
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products:
 * post:
 * summary: Create a product (Admin only)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * price:
 * type: number
 * description:
 * type: string
 * image:
 * type: string
 * format: binary
 * responses:
 * 201:
 * description: Product created successfully
 * 401:
 * description: Unauthorized
 */
router.post('/', 
    protect, 
    admin, 
    upload.single('image'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
    ],
    validate,
    createProduct
);

export default router;