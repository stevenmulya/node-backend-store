import * as productService from '../services/productService.js';
import sendResponse from '../utils/ApiResponse.js';

export const getProducts = async (req, res, next) => {
    try {
        const data = await productService.getAllInventory();
        sendResponse(res, 200, 'Products retrieved successfully', data);
    } catch (error) {
        next(error);
    }
};

export const getProductDetails = async (req, res, next) => {
    try {
        const data = await productService.getSingleProduct(req.params.id);
        sendResponse(res, 200, 'Product details found', data);
    } catch (error) {
        next(error);
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };
        const data = await productService.storeProduct(productData, req.files, req.user.id);
        sendResponse(res, 201, 'Product added successfully', data);
    } catch (error) {
        next(error);
    }
};

export const updateProductDetails = async (req, res, next) => {
    try {
        const productData = { ...req.body };
        const data = await productService.editProduct(req.params.id, productData, req.files, req.user.id);
        sendResponse(res, 200, 'Product updated successfully', data);
    } catch (error) {
        next(error);
    }
};

export const deleteProductEntry = async (req, res, next) => {
    try {
        await productService.removeProduct(req.params.id, req.user.id);
        sendResponse(res, 200, 'Product moved to trash successfully');
    } catch (error) {
        next(error);
    }
};