import express from 'express';
import * as customerController from '../controllers/customerAuthController.js';
import * as formController from '../controllers/customerFormController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.get('/verify-email', customerController.verifyEmail);
router.post('/resend-verification', customerController.resendEmail);
router.get('/form-fields', customerController.getRegistrationForm);

router.use(protect);

router.get('/', authorize(1), customerController.getCustomers);
router.get('/:id', authorize(2), customerController.getCustomer);
router.delete('/:id', authorize(3), customerController.deleteCustomer);

router.get('/manage/fields', authorize(2), formController.getFields);
router.post('/manage/fields', authorize(3), formController.createField);
router.delete('/manage/fields/:id', authorize(3), formController.deleteField);
router.patch('/manage/fields/:id/toggle', authorize(3), formController.toggleActive);

export default router;