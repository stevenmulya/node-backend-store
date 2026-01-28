import * as categoryService from '../services/categoryService.js';
import sendResponse from '../utils/ApiResponse.js';

export const getTree = async (req, res, next) => {
    try {
        const tree = await categoryService.getCategoryTree();
        sendResponse(res, 200, 'Category tree retrieved', tree);
    } catch (error) {
        next(error);
    }
};

export const addCategory = async (req, res, next) => {
    try {
        const category = await categoryService.storeCategory(req.body);
        sendResponse(res, 201, 'Category created successfully', category);
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.removeCategory(req.params.id);
        sendResponse(res, 200, 'Category deleted successfully');
    } catch (error) {
        if (error.original && error.original.errno === 1451) {
            return sendResponse(
                res, 
                400, 
                "This category cannot be deleted because it is currently associated with existing products or sub-categories."
            );
        }
        next(error);
    }
};