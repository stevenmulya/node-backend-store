import * as productRepo from '../repositories/productRepository.js';
import * as attrService from './attributeService.js';
import * as historyService from './historyService.js';
import * as categoryRepo from '../repositories/categoryRepository.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { trackDiff } from '../utils/activityLogger.js';

export const getAllInventory = (queryOptions) => productRepo.findAll(queryOptions);

export const getSingleProduct = (id) => productRepo.findById(id);

export const storeProduct = async (productData, files, user) => {
    const transaction = await db.transaction();
    try {
        const { attributes, ...pureData } = productData;
        const product = await productRepo.create({ ...pureData, created_by: user.id }, transaction);
        
        await attrService.syncProductAttributes(product.id, attributes, transaction);

        if (files && files.length > 0) {
            const imagePayload = files.map((file, index) => ({
                product_id: product.id,
                url: `/uploads/products/${file.filename}`,
                is_primary: index === 0
            }));
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }
        
        await historyService.recordActivity(
            product.id, product.name, 'CREATED', user.id, 
            { note: 'Initial creation' }, transaction
        );

        await transaction.commit();
        return await productRepo.findById(product.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const editProduct = async (id, productData, files, user) => {
    const transaction = await db.transaction();
    try {
        const product = await productRepo.findById(id);
        if (!product) throw new ApiError('Product not found', 404);

        const { attributes, ...pureData } = productData;
        const oldData = product.get({ plain: true });

        const templates = await attrService.getTemplates(product.category_id);

        await productRepo.update(id, { ...pureData, updated_by: user.id }, transaction);
        await attrService.syncProductAttributes(id, attributes, transaction);

        if (files && files.length > 0) {
            const imagePayload = files.map(file => ({
                product_id: id,
                url: `/uploads/products/${file.filename}`,
                is_primary: false
            }));
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }

        const updatedFields = trackDiff(oldData, { ...pureData, attributes }, {}, templates);
        
        if (updatedFields) {
            await historyService.recordActivity(
                id, oldData.name, 'UPDATED', user.id,
                { updated_fields: updatedFields }, 
                transaction
            );
        }

        await transaction.commit();
        return await productRepo.findById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const removeProduct = async (id, user) => {
    const transaction = await db.transaction();
    try {
        const product = await productRepo.findById(id);
        if (!product) throw new ApiError('Product not found', 404);
        await historyService.recordActivity(id, product.name, 'DELETED', user.id, {}, transaction);
        await productRepo.softDelete(id, user.id, transaction);
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};