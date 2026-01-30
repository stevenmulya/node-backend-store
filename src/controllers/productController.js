import * as productService from '../services/productService.js';
import * as attrService from '../services/attributeService.js';
import * as historyService from '../services/historyService.js';
import { buildInventoryQuery } from '../specifications/productSpecification.js';
import sendResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../config/database.js';

export const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const queryOptions = buildInventoryQuery(req.query);
    
    const result = await productService.getAllInventory(queryOptions, page, limit);
    sendResponse(res, 200, 'Products retrieved successfully', result.data, result.meta);
});

export const getProductDetails = asyncHandler(async (req, res) => {
    const data = await productService.getSingleProduct(req.params.id);
    if (!data) return sendResponse(res, 404, 'Product not found');
    sendResponse(res, 200, 'Product details retrieved', data);
});

export const addProduct = asyncHandler(async (req, res) => {
    const payload = { ...req.body, userId: req.user.id };
    const data = await productService.storeProduct(payload, req.files);
    sendResponse(res, 201, 'Product added successfully', data);
});

export const updateProductDetails = asyncHandler(async (req, res) => {
    const payload = { ...req.body, userId: req.user.id };
    const data = await productService.editProduct(req.params.id, payload, req.files);
    sendResponse(res, 200, 'Product updated successfully', data);
});

export const unpublishAllProducts = asyncHandler(async (req, res) => {
    await productService.massUnpublish(req.user.id);
    sendResponse(res, 200, 'All products have been unpublished successfully');
});

export const exportProductsToCSV = asyncHandler(async (req, res) => {
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="inventory-export-${Date.now()}.csv"`);
    await productService.streamProductCSV(res);
});

export const removeProduct = asyncHandler(async (req, res) => {
    await productService.removeProduct(req.params.id, req.user.id);
    sendResponse(res, 200, 'Product deleted successfully');
});

export const getAttributeTemplates = asyncHandler(async (req, res) => {
    const data = await attrService.getTemplates(req.params.categoryId);
    sendResponse(res, 200, 'Templates retrieved', data);
});

export const updateAttributeTemplates = asyncHandler(async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { categoryId, fields } = req.body;
        await attrService.updateTemplates(categoryId, fields, transaction);
        await transaction.commit();
        sendResponse(res, 200, 'Templates updated successfully');
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

export const getAllTemplates = asyncHandler(async (req, res) => {
    const data = await attrService.getAllTemplates();
    sendResponse(res, 200, 'All templates retrieved', data);
});

export const getProductHistory = asyncHandler(async (req, res) => {
    const data = await historyService.getHistoryByProduct(req.params.id);
    const formatted = data.map(h => ({
        id: h.id,
        action: h.action,
        performed_by: h.performer?.name || 'System',
        timestamp: h.createdAt,
        changes: h.details,
        product_name: h.product_name_at_time
    }));
    sendResponse(res, 200, 'History retrieved successfully', formatted);
});