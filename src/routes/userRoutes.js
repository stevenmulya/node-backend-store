import express from 'express';
import { 
    getUsers, 
    authUser, 
    registerUser, 
    getUserProfile 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/userSchema.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authUser);
router.post('/register', validate(registerSchema), registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, authorize('OWNER', 'MANAGER'), getUsers);

export default router;