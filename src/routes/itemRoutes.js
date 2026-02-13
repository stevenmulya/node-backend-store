import express from 'express';
import * as itemController from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { createItemSchema } from '../validations/itemSchema.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('OWNER', 'MANAGER', 'STAFF'), itemController.getItems)
  .post(protect, authorize('OWNER', 'MANAGER'), validate(createItemSchema), itemController.addItem);

router.patch('/bulk-unpublish', protect, authorize('OWNER'), itemController.unpublishAll);

router.route('/:id')
  .get(protect, authorize('OWNER', 'MANAGER', 'STAFF'), itemController.getItemById);

export default router;