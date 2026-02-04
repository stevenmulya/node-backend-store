import express from 'express';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.get('/', orderController.getOrdersList);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);

export default router;