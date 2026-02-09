import * as productRepo from '../repositories/productRepository.js';
import * as attrService from './attributeService.js';
import * as historyService from './historyService.js';
import ProductVideo from '../models/product/productVideoModel.js';
import ProductVariant from '../models/product/productVariantModel.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { trackDiff } from '../utils/activityLogger.js';
import { calculateVariantActions } from '../utils/variantUtils.js';

const syncVariants = async (productId, newVariants, transaction) => {
    const currentVariants = await ProductVariant.findAll({ 
        where: { product_id: productId },
        attributes: ['id'],
        transaction 
    });

    const currentIds = currentVariants.map(v => v.id);
    const { toDeleteIds, toUpdate, toCreate } = calculateVariantActions(currentIds, newVariants);

    if (toDeleteIds.length > 0) {
        await ProductVariant.destroy({ where: { id: toDeleteIds }, transaction });
    }

    for (const item of toUpdate) {
        await ProductVariant.update({
            sku: item.sku,
            options: item.options,
            price: item.price,
            stock: item.stock,
            weight: item.weight
        }, { where: { id: item.id }, transaction });
    }

    if (toCreate.length > 0) {
        const createPayload = toCreate.map(item => ({ ...item, product_id: productId }));
        await ProductVariant.bulkCreate(createPayload, { transaction });
    }
};

const replaceVideos = async (productId, videos, transaction) => {
    await ProductVideo.destroy({ where: { product_id: productId }, transaction });
    if (videos?.length > 0) {
        const videoPayload = videos.map((vid, index) => ({
            ...vid,
            product_id: productId,
            sort_order: index
        }));
        await ProductVideo.bulkCreate(videoPayload, { transaction });
    }
};

export const getAllInventory = async (queryOptions, page = 1, limit = 10) => {
    const { total, data } = await productRepo.findAll({
        ...queryOptions,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
    });

    return {
        data,
        meta: {
            total_data: total,
            total_pages: Math.ceil(total / limit),
            current_page: parseInt(page),
            per_page: parseInt(limit)
        }
    };
};

export const getSingleProduct = (id) => productRepo.findById(id);

export const storeProduct = async (payload, files) => {
    let currentPayload = { ...payload };
    let attempts = 0;
    const MAX_RETRIES = 5;

    while (attempts < MAX_RETRIES) {
        const transaction = await db.transaction();
        try {
            const { attributes, videos, variants, userId, ...productData } = currentPayload;

            const product = await productRepo.create({
                ...productData,
                created_by: userId
            }, transaction);
            
            if (attributes) await attrService.syncProductAttributes(product.id, attributes, transaction);

            if (files?.length > 0) {
                const imagePayload = files.map((file, index) => ({
                    product_id: product.id,
                    url: file.path || file.secure_url, 
                    is_primary: index === 0
                }));
                await productRepo.bulkCreateImages(imagePayload, transaction);
            }
            
            if (videos?.length > 0) await replaceVideos(product.id, videos, transaction);

            if (productData.product_type === 'variable' && variants?.length > 0) {
                const variantPayload = variants.map(v => ({ ...v, product_id: product.id }));
                await ProductVariant.bulkCreate(variantPayload, { transaction });
            }

            await historyService.recordActivity(
                product.id, product.name, 'CREATED', userId, 
                { note: 'Initial creation' }, transaction
            );

            await transaction.commit();
            return await productRepo.findById(product.id);

        } catch (error) {
            await transaction.rollback();
            if (error.name === 'SequelizeUniqueConstraintError' && (error.fields?.slug || error.message?.includes('slug'))) {
                currentPayload.slug = `${currentPayload.slug}-${Math.floor(Math.random() * 10000)}`;
                attempts++;
                continue;
            }
            if (error.name === 'SequelizeUniqueConstraintError' && (error.fields?.sku || error.message?.includes('sku'))) {
                throw new ApiError(`SKU '${currentPayload.sku}' already exists.`, 400);
            }
            throw error;
        }
    }
    throw new ApiError("Failed to create product: Slug collision limit reached.", 500);
};

export const editProduct = async (id, payload, files) => {
    let currentPayload = { ...payload };
    let attempts = 0;
    const MAX_RETRIES = 5;

    while (attempts < MAX_RETRIES) {
        const transaction = await db.transaction();
        try {
            const product = await productRepo.findById(id);
            if (!product) throw new ApiError('Product not found', 404);

            const { attributes, videos, variants, userId, ...productData } = currentPayload;
            const oldData = product.get({ plain: true });
            const templates = await attrService.getTemplates(product.category_id);

            await productRepo.update(id, { ...productData, updated_by: userId }, transaction);
            
            if (attributes) await attrService.syncProductAttributes(id, attributes, transaction);

            if (files?.length > 0) {
                const imagePayload = files.map(file => ({
                    product_id: id,
                    url: file.path || file.secure_url,
                    is_primary: false
                }));
                await productRepo.bulkCreateImages(imagePayload, transaction);
            }

            if (videos) await replaceVideos(id, videos, transaction);

            let isVariantUpdated = false;
            if (productData.product_type === 'variable' && variants) {
                await syncVariants(id, variants, transaction);
                isVariantUpdated = true;
            } else if (productData.product_type === 'simple') {
                await ProductVariant.destroy({ where: { product_id: id }, transaction });
            }

            let updatedFields = trackDiff(oldData, { ...productData, attributes }, {}, templates) || [];
            if (productData.product_type === 'variable') {
                updatedFields = updatedFields.filter(f => f !== 'price' && f !== 'stock');
            }
            if (isVariantUpdated) updatedFields.push('variants');

            const finalFields = [...new Set(updatedFields)];
            if (finalFields.length > 0) {
                await historyService.recordActivity(
                    id, oldData.name, 'UPDATED', userId,
                    { updated_fields: finalFields }, 
                    transaction
                );
            }

            await transaction.commit();
            return await productRepo.findById(id);

        } catch (error) {
            await transaction.rollback();
            if (error.name === 'SequelizeUniqueConstraintError' && (error.fields?.slug || error.message?.includes('slug'))) {
                currentPayload.slug = `${currentPayload.slug}-${Math.floor(Math.random() * 10000)}`;
                attempts++;
                continue;
            }
            throw error;
        }
    }
    throw new ApiError("Failed to update product: Slug collision limit reached.", 500);
};

export const massUnpublish = async (userId) => {
    const transaction = await db.transaction();
    try {
        const affectedRows = await productRepo.updateAll(
            { is_published: false, updated_by: userId }, 
            { is_published: true },
            transaction
        );
        await transaction.commit();
        return affectedRows;
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
        
        await historyService.recordActivity(id, product.name, 'DELETED', userId, {}, transaction);
        await productRepo.softDelete(id, userId, transaction);
        
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};