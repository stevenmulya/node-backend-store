import { Parser } from 'json2csv';
import * as productRepo from '../repositories/productRepository.js';
import * as attrService from './attributeService.js';
import * as historyService from './historyService.js';
import ProductVideo from '../models/productVideoModel.js';
import ProductVariant from '../models/productVariantModel.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { trackDiff } from '../utils/activityLogger.js';

const sanitizeNumber = (val) => {
    if (!val || val === '' || val === 'null' || val === 'undefined') return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
};

export const getAllInventory = (queryOptions) => productRepo.findAll(queryOptions);

export const getSingleProduct = (id) => productRepo.findById(id);

export const storeProduct = async (productData, files, user) => {
    const transaction = await db.transaction();
    try {
        const { attributes, videos, variants, ...pureData } = productData;

        const sanitizedData = {
            ...pureData,
            price: sanitizeNumber(pureData.price),
            countInStock: sanitizeNumber(pureData.countInStock),
            weight: sanitizeNumber(pureData.weight),
            length: sanitizeNumber(pureData.length),
            width: sanitizeNumber(pureData.width),
            height: sanitizeNumber(pureData.height),
            created_by: user.id
        };

        const product = await productRepo.create(sanitizedData, transaction);
        
        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try { parsedAttributes = JSON.parse(attributes); } catch (e) { parsedAttributes = {}; }
        }
        await attrService.syncProductAttributes(product.id, parsedAttributes, transaction);

        if (files && files.length > 0) {
            const imagePayload = files.map((file, index) => ({
                product_id: product.id,
                url: `/uploads/products/${file.filename}`,
                is_primary: index === 0
            }));
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }
        
        let parsedVideos = videos;
        if (typeof videos === 'string') {
            try { parsedVideos = JSON.parse(videos); } catch (e) { parsedVideos = []; }
        }

        if (parsedVideos && Array.isArray(parsedVideos) && parsedVideos.length > 0) {
            const videoPayload = parsedVideos.map((vid, index) => ({
                ...vid,
                product_id: product.id,
                sort_order: index
            }));
            await ProductVideo.bulkCreate(videoPayload, { transaction });
        }

        let parsedVariants = variants;
        if (typeof variants === 'string') {
            try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
        }

        if (pureData.product_type === 'variable' && parsedVariants && Array.isArray(parsedVariants) && parsedVariants.length > 0) {
            const variantPayload = parsedVariants.map(variant => ({
                ...variant,
                price: sanitizeNumber(variant.price),
                stock: sanitizeNumber(variant.stock),
                weight: sanitizeNumber(variant.weight),
                product_id: product.id
            }));
            await ProductVariant.bulkCreate(variantPayload, { transaction });
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

        const { attributes, videos, variants, ...pureData } = productData;
        const oldData = product.get({ plain: true });

        const sanitizedData = {
            ...pureData,
            price: sanitizeNumber(pureData.price),
            countInStock: sanitizeNumber(pureData.countInStock),
            weight: sanitizeNumber(pureData.weight),
            length: sanitizeNumber(pureData.length),
            width: sanitizeNumber(pureData.width),
            height: sanitizeNumber(pureData.height),
            updated_by: user.id
        };

        const templates = await attrService.getTemplates(product.category_id);

        await productRepo.update(id, sanitizedData, transaction);

        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try { parsedAttributes = JSON.parse(attributes); } catch (e) { parsedAttributes = {}; }
        }
        await attrService.syncProductAttributes(id, parsedAttributes, transaction);

        if (files && files.length > 0) {
            const imagePayload = files.map(file => ({
                product_id: id,
                url: `/uploads/products/${file.filename}`,
                is_primary: false
            }));
            await productRepo.bulkCreateImages(imagePayload, transaction);
        }

        let parsedVideos = videos;
        if (typeof videos === 'string') {
            try { parsedVideos = JSON.parse(videos); } catch (e) { parsedVideos = []; }
        }

        if (parsedVideos) {
            await ProductVideo.destroy({ where: { product_id: id }, transaction });
            if (parsedVideos.length > 0) {
                const videoPayload = parsedVideos.map((vid, index) => ({
                    ...vid,
                    product_id: id,
                    sort_order: index
                }));
                await ProductVideo.bulkCreate(videoPayload, { transaction });
            }
        }

        let parsedVariants = variants;
        if (typeof variants === 'string') {
            try { parsedVariants = JSON.parse(variants); } catch (e) { parsedVariants = []; }
        }

        let isVariantUpdated = false;
        if (pureData.product_type === 'variable' && parsedVariants) {
            await ProductVariant.destroy({ where: { product_id: id }, transaction });
            if (parsedVariants.length > 0) {
                const variantPayload = parsedVariants.map(variant => ({
                    ...variant,
                    price: sanitizeNumber(variant.price),
                    stock: sanitizeNumber(variant.stock),
                    weight: sanitizeNumber(variant.weight),
                    product_id: id
                }));
                await ProductVariant.bulkCreate(variantPayload, { transaction });
            }
            isVariantUpdated = true;
        }

        let updatedFields = trackDiff(oldData, { ...sanitizedData, attributes: parsedAttributes }, {}, templates) || [];
        
        if (pureData.product_type === 'variable') {
            updatedFields = updatedFields.filter(field => field !== 'price' && field !== 'countInStock');
        }

        if (isVariantUpdated) {
            updatedFields.push('variants');
        }

        updatedFields = [...new Set(updatedFields)];
        
        if (updatedFields.length > 0) {
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

export const massUnpublish = async (user) => {
    const transaction = await db.transaction();
    try {
        const affectedRows = await productRepo.updateAll(
            { is_published: false }, 
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

export const generateProductCSV = async () => {
    const products = await productRepo.findAll({});

    const flattenedData = products.map(p => {
        const base = {
            ID: p.id,
            Name: p.name,
            Slug: p.slug,
            SKU: p.sku || '-',
            Brand: p.brand || '-',
            Category: p.category ? p.category.name : 'Uncategorized',
            Parent_Category: p.category?.parent ? p.category.parent.name : '-',
            Type: p.product_type || 'simple',
            Status: p.is_published ? 'Published' : 'Draft',
            Created_At: new Date(p.createdAt).toISOString().split('T')[0]
        };

        if (p.product_type === 'variable' && p.variants && p.variants.length > 0) {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
            const prices = p.variants.map(v => v.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            return {
                ...base,
                Price: `${minPrice} - ${maxPrice}`,
                Stock: totalStock,
                Variant_Details: p.variants.map(v => 
                    `[${v.sku}: ${JSON.stringify(v.options)} - Stock:${v.stock} - $${v.price}]`
                ).join('; ')
            };
        } else {
            return {
                ...base,
                Price: p.price,
                Stock: p.countInStock,
                Variant_Details: '-'
            };
        }
    });

    const fields = ['ID', 'Name', 'Slug', 'SKU', 'Brand', 'Category', 'Parent_Category', 'Type', 'Price', 'Stock', 'Status', 'Created_At', 'Variant_Details'];
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(flattenedData);
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