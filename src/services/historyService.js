// import * as historyRepo from '../repositories/historyRepository.js';

// export const recordActivity = async (productId, productName, action, userId, details = {}, transaction = null) => {
//     return await historyRepo.createHistory({
//         product_id: productId,
//         product_name_at_time: productName,
//         action: action,
//         performed_by: userId,
//         details: details
//     }, transaction);
// };

// export const getHistoryByProduct = async (productId) => {
//     return await historyRepo.findByProductId(productId);
// };