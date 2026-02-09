import { Op } from 'sequelize';
import Product from '../models/product/productModel.js';
import User from '../models/user/userModel.js';
import Category from '../models/product/categoryModel.js';
import ProductImage from '../models/product/productImageModel.js';
import ProductAttribute from '../models/product/productAttributeModel.js';
import AttributeTemplate from '../models/product/attributeTemplateModel.js';
import ProductVideo from '../models/product/productVideoModel.js';
import ProductVariant from '../models/product/productVariantModel.js';

export const findAll = async ({ where, include, order, limit, offset }) => {
    const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include,
        distinct: true,
        subQuery: false,
    });

    return { total: count, data: rows };
};

export const findById = async (id) => {
    return await Product.findByPk(id, {
        include: [
            { 
                model: User, 
                as: 'creator', 
                attributes: ['name'] 
            },
            { 
                model: User, 
                as: 'editor', 
                attributes: ['name'] 
            },
            {
                model: Category,
                as: 'category',
                include: [{ model: Category, as: 'parent', attributes: ['name'] }]
            },
            { 
                model: ProductImage, 
                as: 'images' 
            },
            {
                model: ProductVideo,
                as: 'videos',
                attributes: ['id', 'provider', 'video_url', 'title', 'sort_order']
            },
            {
                model: ProductVariant,
                as: 'variants'
            },
            {
                model: ProductAttribute,
                as: 'attributeValues',
                include: [{ 
                    model: AttributeTemplate, 
                    as: 'template', 
                    attributes: ['id', 'name', 'type'] 
                }]
            }
        ],
        order: [
            [{ model: ProductVideo, as: 'videos' }, 'sort_order', 'ASC'],
            [{ model: ProductVariant, as: 'variants' }, 'id', 'ASC']
        ]
    });
};

export const create = async (data, transaction) => {
    return await Product.create(data, { transaction });
};

export const bulkCreateImages = async (images, transaction) => {
    return await ProductImage.bulkCreate(images, { transaction });
};

export const update = async (id, data, transaction) => {
    return await Product.update(data, { 
        where: { id }, 
        transaction 
    });
};

export const updateAll = async (data, whereClause, transaction) => {
    return await Product.update(data, {
        where: whereClause,
        transaction
    });
};

export const remove = async (id, transaction) => {
    return await Product.destroy({ 
        where: { id }, 
        transaction 
    });
};

export const softDelete = async (id, userId, transaction) => {
    await Product.update(
        { deleted_by: userId }, 
        { where: { id }, transaction }
    );
    return await Product.destroy({ 
        where: { id }, 
        transaction 
    });
};