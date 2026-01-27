import * as productRepo from '../repositories/productRepository.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';

export const getAllInventory = async () => {
    return await productRepo.findAll();
};

export const getSingleProduct = async (id) => {
    const product = await productRepo.findById(id);
    if (!product) throw new ApiError('Product not found', 404);
    return product;
};

export const storeProduct = async (productData, files, userId) => {
    const transaction = await db.transaction();
    try {
        const product = await productRepo.create({ 
            ...productData, 
            created_by: userId 
        }, transaction);

        const imagePayload = [];

        if (files && files.length > 0) {
            files.forEach((file, index) => {
                imagePayload.push({
                    product_id: product.id,
                    url: `/${file.path.replace(/\\/g, "/").replace("public/", "")}`,
                    is_primary: index === 0
                });
            });
        }

        if (productData.images && Array.isArray(productData.images)) {
            productData.images.forEach(url => {
                imagePayload.push({
                    product_id: product.id,
                    url: url,
                    is_primary: imagePayload.length === 0
                });
            });
        }

        if (imagePayload.length > 0) {
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }

        await transaction.commit();
        return await productRepo.findById(product.id);
    } catch (error) {
        await transaction.rollback();
        throw new ApiError(error.message, 500);
    }
};

export const editProduct = async (id, productData, files, userId) => {
    const transaction = await db.transaction();
    try {
        const product = await productRepo.findById(id);
        if (!product) throw new ApiError('Product not found', 404);

        await productRepo.update(id, { 
            ...productData, 
            updated_by: userId 
        }, transaction);

        const imagePayload = [];

        if (files && files.length > 0) {
            files.forEach(file => {
                imagePayload.push({
                    product_id: id,
                    url: `/${file.path.replace(/\\/g, "/").replace("public/", "")}`,
                    is_primary: false
                });
            });
        }

        if (imagePayload.length > 0) {
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }

        await transaction.commit();
        return await productRepo.findById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const removeProduct = async (id, userId) => {
    const transaction = await db.transaction();
    try {
        const product = await productRepo.findById(id);
        if (!product) throw new ApiError('Product not found', 404);
        await productRepo.softDelete(id, userId, transaction);
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};