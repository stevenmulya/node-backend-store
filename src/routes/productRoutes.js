import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadMultipleImages } from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validations/productSchema.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize(1), productController.getProducts)
    .post(
        protect, 
        authorize(2), 
        uploadMultipleImages, 
        validate(createProductSchema), 
        productController.addProduct
    );

router.patch('/bulk-unpublish', protect, authorize(2), productController.unpublishAllProducts);
router.get('/export-csv', protect, authorize(1), productController.exportProductsToCSV);

router.get('/attributes/templates', protect, authorize(1), productController.getAllTemplates);
router.post('/attributes/templates', protect, authorize(2), productController.updateAttributeTemplates);
router.get('/attributes/templates/:categoryId', protect, authorize(1), productController.getAttributeTemplates);

router.get('/:id/history', protect, authorize(1), productController.getProductHistory);

router.route('/:id')
    .get(protect, authorize(1), productController.getProductDetails)
    .put(
        protect, 
        authorize(2), 
        uploadMultipleImages, 
        validate(updateProductSchema), 
        productController.updateProductDetails
    )
    .delete(protect, authorize(3), productController.removeProduct);

export default router;