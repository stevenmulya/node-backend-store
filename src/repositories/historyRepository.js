import ProductHistory from '../models/product/productHistoryModel.js';
import User from '../models/user/userModel.js';

export const createHistory = async (data, transaction) => {
    return await ProductHistory.create(data, { transaction });
};

export const findByProductId = async (productId) => {
    return await ProductHistory.findAll({
        where: { product_id: productId },
        include: [{ model: User, as: 'performer', attributes: ['name'] }],
        order: [['createdAt', 'DESC']]
    });
};