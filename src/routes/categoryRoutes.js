import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, categoryController.getTree)
    .post(protect, authorize(2), categoryController.addCategory);

router.route('/:id')
    .delete(protect, authorize(3), categoryController.deleteCategory);

export default router;