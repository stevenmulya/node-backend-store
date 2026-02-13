// import * as categoryService from '../services/categoryService.js';
// import sendResponse from '../utils/ApiResponse.js';
// import asyncHandler from '../utils/asyncHandler.js';

// export const getTree = asyncHandler(async (req, res) => {
//     const tree = await categoryService.getCategoryTree();
//     sendResponse(res, 200, 'Category tree retrieved', tree);
// });

// export const addCategory = asyncHandler(async (req, res) => {
//     const category = await categoryService.storeCategory(req.body);
//     sendResponse(res, 201, 'Category created successfully', category);
// });

// export const deleteCategory = asyncHandler(async (req, res) => {
//     try {
//         await categoryService.removeCategory(req.params.id);
//         sendResponse(res, 200, 'Category deleted successfully');
//     } catch (error) {
//         if (error.original && error.original.errno === 1451) {
//             return sendResponse(
//                 res, 
//                 400, 
//                 "This category cannot be deleted because it is currently associated with existing products or sub-categories."
//             );
//         }
//         throw error;
//     }
// });