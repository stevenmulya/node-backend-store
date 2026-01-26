import express from 'express';
import { body } from 'express-validator';
import { authUser, registerUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 * - name: Users
 * description: User management
 */

/**
 * @swagger
 * /api/users/login:
 * post:
 * summary: Auth user & get token
 * tags: [Users]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: User logged in
 * 401:
 * description: Invalid credentials
 */
router.post('/login', authUser);

/**
 * @swagger
 * /api/users/register:
 * post:
 * summary: Register a new user
 * tags: [Users]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * isAdmin:
 * type: boolean
 * responses:
 * 201:
 * description: User registered
 * 400:
 * description: Invalid data
 */
router.post('/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters')
    ],
    validate,
    registerUser
);

/**
 * @swagger
 * /api/users/profile:
 * get:
 * summary: Get user profile
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User profile data
 * 401:
 * description: Not authorized
 */
router.get('/profile', protect, getUserProfile);

export default router;