import * as productRepo from '../repositories/productRepository.js';
import * as attrService from './attributeService.js';
import * as historyService from './historyService.js';
import ProductVideo from '../models/productVideoModel.js';
import ProductVariant from '../models/productVariantModel.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { trackDiff } from '../utils/activityLogger.js';

export const getAllInventory = async (queryOptions, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const optionsWithPagination = {
        ...queryOptions,
        limit: parseInt(limit),
        offset: parseInt(offset)
    };

    const { total, data } = await productRepo.findAll(optionsWithPagination);

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

    while (true) {
        const transaction = await db.transaction();
        try {
            const { attributes, videos, variants, userId, ...productData } = currentPayload;

            const product = await productRepo.create({
                ...productData,
                created_by: userId
            }, transaction);
            
            if (attributes) {
                await attrService.syncProductAttributes(product.id, attributes, transaction);
            }

            if (files && files.length > 0) {
                const imagePayload = files.map((file, index) => ({
                    product_id: product.id,
                    url: file.path || file.secure_url, 
                    is_primary: index === 0
                }));
                await productRepo.bulkCreateImages(imagePayload, transaction);
            }
            
            if (videos && videos.length > 0) {
                const videoPayload = videos.map((vid, index) => ({
                    ...vid,
                    product_id: product.id,
                    sort_order: index
                }));
                await ProductVideo.bulkCreate(videoPayload, { transaction });
            }

            if (productData.product_type === 'variable' && variants && variants.length > 0) {
                const variantPayload = variants.map(variant => ({
                    ...variant,
                    product_id: product.id
                }));
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

            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields?.slug || error.message?.includes('slug')) {
                    currentPayload.slug = `${currentPayload.slug}-${Date.now().toString().slice(-4)}`;
                    continue;
                }
                if (error.fields?.sku || error.message?.includes('sku')) {
                    throw new ApiError(`SKU '${currentPayload.sku}' already exists.`, 400);
                }
            }
            throw error;
        }
    }
};

export const editProduct = async (id, payload, files) => {
    let currentPayload = { ...payload };

    while (true) {
        const transaction = await db.transaction();
        try {
            const product = await productRepo.findById(id);
            if (!product) throw new ApiError('Product not found', 404);

            const { attributes, videos, variants, userId, ...productData } = currentPayload;
            const oldData = product.get({ plain: true });

            const templates = await attrService.getTemplates(product.category_id);

            await productRepo.update(id, { ...productData, updated_by: userId }, transaction);
            
            if (attributes) {
                await attrService.syncProductAttributes(id, attributes, transaction);
            }

            if (files && files.length > 0) {
                const imagePayload = files.map(file => ({
                    product_id: id,
                    url: file.path || file.secure_url,
                    is_primary: false
                }));
                await productRepo.bulkCreateImages(imagePayload, transaction);
            }

            if (videos) {
                await ProductVideo.destroy({ where: { product_id: id }, transaction });
                if (videos.length > 0) {
                    const videoPayload = videos.map((vid, index) => ({
                        ...vid,
                        product_id: id,
                        sort_order: index
                    }));
                    await ProductVideo.bulkCreate(videoPayload, { transaction });
                }
            }

            let isVariantUpdated = false;
            if (productData.product_type === 'variable' && variants) {
                await ProductVariant.destroy({ where: { product_id: id }, transaction });
                if (variants.length > 0) {
                    const variantPayload = variants.map(variant => ({
                        ...variant,
                        product_id: id
                    }));
                    await ProductVariant.bulkCreate(variantPayload, { transaction });
                }
                isVariantUpdated = true;
            }

            let updatedFields = trackDiff(oldData, { ...productData, attributes }, {}, templates) || [];
            
            if (productData.product_type === 'variable') {
                updatedFields = updatedFields.filter(field => field !== 'price' && field !== 'stock');
            }

            if (isVariantUpdated) {
                updatedFields.push('variants');
            }

            updatedFields = [...new Set(updatedFields)];
            
            if (updatedFields.length > 0) {
                await historyService.recordActivity(
                    id, oldData.name, 'UPDATED', userId,
                    { updated_fields: updatedFields }, 
                    transaction
                );
            }

            await transaction.commit();
            return await productRepo.findById(id);

        } catch (error) {
            await transaction.rollback();

            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.fields?.slug || error.message?.includes('slug')) {
                    currentPayload.slug = `${currentPayload.slug}-${Date.now().toString().slice(-4)}`;
                    continue;
                }
                if (error.fields?.sku || error.message?.includes('sku')) {
                    throw new ApiError(`SKU '${currentPayload.sku}' already exists.`, 400);
                }
            }
            throw error;
        }
    }
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

export const streamProductCSV = async (res) => {
    const BATCH_SIZE = 500;
    let offset = 0;
    
    res.write('ID,Name,Slug,SKU,Brand,Category,Parent_Category,Type,Price,Stock,Status,Created_At,Variant_Details\n');

    while (true) {
        const { data: products } = await productRepo.findAll({
            limit: BATCH_SIZE,
            offset: offset,
            raw: false
        });

        if (products.length === 0) break;

        const chunk = products.map(p => {
            const base = [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                p.slug,
                p.sku || '-',
                p.brand || '-',
                p.category ? `"${p.category.name}"` : 'Uncategorized',
                p.category?.parent ? `"${p.category.parent.name}"` : '-',
                p.product_type || 'simple',
            ];

            let price = p.price;
            let stock = p.stock;
            let variantsDetails = '-';

            if (p.product_type === 'variable' && p.variants?.length > 0) {
                stock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const prices = p.variants.map(v => Number(v.price));
                price = `${Math.min(...prices)} - ${Math.max(...prices)}`;
                
                variantsDetails = `"${p.variants.map(v => 
                    `[${v.sku}: ${JSON.stringify(v.options).replace(/"/g, "'")} - Stock:${v.stock} - $${v.price}]`
                ).join('; ')}"`;
            }

            return [
                ...base,
                price,
                stock,
                p.is_published ? 'Published' : 'Draft',
                new Date(p.createdAt).toISOString().split('T')[0],
                variantsDetails
            ].join(',');
        }).join('\n');

        res.write(chunk + '\n');
        
        if (products.length < BATCH_SIZE) break;
        offset += BATCH_SIZE;
        
        if (global.gc) global.gc();
    }
    
    res.end();
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