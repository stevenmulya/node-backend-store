import * as productService from '../services/productService.js';
import * as attrService from '../services/attributeService.js';
import * as historyService from '../services/historyService.js';
import { buildInventoryQuery } from '../specifications/productSpecification.js';
import sendResponse from '../utils/ApiResponse.js';
import db from '../config/database.js';

export const getProducts = async (req, res, next) => {
    try {
        const queryOptions = buildInventoryQuery(req.query);
        const data = await productService.getAllInventory(queryOptions);
        sendResponse(res, 200, 'Products retrieved successfully', data);
    } catch (error) {
        next(error);
    }
};

export const getProductDetails = async (req, res, next) => {
    try {
        const data = await productService.getSingleProduct(req.params.id);
        if (!data) return sendResponse(res, 404, 'Product not found');
        sendResponse(res, 200, 'Product details retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const data = await productService.storeProduct(req.body, req.files, req.user);
        sendResponse(res, 201, 'Product added successfully', data);
    } catch (error) {
        next(error);
    }
};

export const updateProductDetails = async (req, res, next) => {
    try {
        const data = await productService.editProduct(req.params.id, req.body, req.files, req.user);
        sendResponse(res, 200, 'Product updated successfully', data);
    } catch (error) {
        next(error);
    }
};

export const unpublishAllProducts = async (req, res, next) => {
    try {
        await productService.massUnpublish(req.user);
        sendResponse(res, 200, 'All products have been unpublished successfully');
    } catch (error) {
        next(error);
    }
};

export const exportProductsToCSV = async (req, res, next) => {
    try {
        const csvData = await productService.generateProductCSV();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="inventory-export-${Date.now()}.csv"`);
        res.send(csvData);
    } catch (error) {
        next(error);
    }
};

export const removeProduct = async (req, res, next) => {
    try {
        await productService.removeProduct(req.params.id, req.user);
        sendResponse(res, 200, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const getAttributeTemplates = async (req, res, next) => {
    try {
        const data = await attrService.getTemplates(req.params.categoryId);
        sendResponse(res, 200, 'Templates retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const updateAttributeTemplates = async (req, res, next) => {
    const transaction = await db.transaction();
    try {
        const { categoryId, fields } = req.body;
        await attrService.updateTemplates(categoryId, fields, transaction);
        await transaction.commit();
        sendResponse(res, 200, 'Templates updated successfully');
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getAllTemplates = async (req, res, next) => {
    try {
        const data = await attrService.getAllTemplates();
        sendResponse(res, 200, 'All templates retrieved', data);
    } catch (error) {
        next(error);
    }
};

export const getProductHistory = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};