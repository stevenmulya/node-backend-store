import express from 'express';
import { authUser, registerUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/userSchema.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authUser);

router.post('/register', validate(registerSchema), registerUser);

router.get('/profile', protect, getUserProfile);

export default router;