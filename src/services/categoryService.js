// import * as categoryRepo from '../repositories/categoryRepository.js';
// import ApiError from '../utils/ApiError.js';

// export const getCategoryTree = async () => {
//     const categories = await categoryRepo.findAll();
//     const categoryMap = {};

//     categories.forEach(cat => {
//         categoryMap[cat.id] = { ...cat.toJSON(), children: [] };
//     });

//     const tree = [];
//     categories.forEach(cat => {
//         if (cat.parent_id) {
//             if (categoryMap[cat.parent_id]) {
//                 categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
//             }
//         } else {
//             tree.push(categoryMap[cat.id]);
//         }
//     });

//     return tree;
// };

// export const getAllChildrenIds = async (parentId) => {
//     const categories = await categoryRepo.findAll();
//     const allIds = [];

//     const findChildren = (id) => {
//         allIds.push(parseInt(id));
//         categories.forEach(cat => {
//             if (cat.parent_id === parseInt(id)) {
//                 findChildren(cat.id);
//             }
//         });
//     };

//     findChildren(parentId);
//     return allIds;
// };

// export const storeCategory = async (data) => {
//     if (data.parent_id) {
//         const parent = await categoryRepo.findById(data.parent_id);
//         if (!parent) throw new ApiError('Parent category not found', 404);
//     }
//     return await categoryRepo.create(data);
// };

// export const removeCategory = async (id) => {
//     const category = await categoryRepo.findById(id);
//     if (!category) throw new ApiError('Category not found', 404);
    
//     if (category.children && category.children.length > 0) {
//         throw new ApiError('Cannot delete category that has sub-categories', 400);
//     }

//     return await categoryRepo.destroy(id);
// };