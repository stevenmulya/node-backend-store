import { Op } from 'sequelize';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import ProductImage from '../models/productImageModel.js';
import ProductAttribute from '../models/productAttributeModel.js';
import AttributeTemplate from '../models/attributeTemplateModel.js';
import ProductVideo from '../models/productVideoModel.js';
import ProductVariant from '../models/productVariantModel.js';

export const findAll = async ({ page, limit, search, sort, category_id }) => {
    const validPage = parseInt(page) > 0 ? parseInt(page) : 1;
    const validLimit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (validPage - 1) * validLimit;

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'name_asc') order = [['name', 'ASC']];

    const where = {};
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } }
        ];
    }
    if (category_id) {
        where.category_id = category_id;
    }

    const { count, rows } = await Product.findAndCountAll({
        where,
        limit: validLimit,
        offset: offset,
        order,
        distinct: true,
        include: [
            { model: User, as: 'creator', attributes: ['name'] },
            { model: User, as: 'editor', attributes: ['name'] },
            { 
                model: Category, 
                as: 'category', 
                include: [{ model: Category, as: 'parent', attributes: ['name'] }] 
            },
            { model: ProductImage, as: 'images' },
            {
                model: ProductVideo,
                as: 'videos',
                attributes: ['id', 'provider', 'video_url', 'external_id', 'thumbnail_url', 'title', 'duration', 'is_primary', 'sort_order']
            },
            {
                model: ProductVariant,
                as: 'variants'
            },
            { 
                model: ProductAttribute, 
                as: 'attributeValues',
                include: [{ model: AttributeTemplate, as: 'template', attributes: ['id', 'name', 'type'] }]
            }
        ]
    });

    return { total: count, data: rows };
};

export const findById = async (id) => {
    return await Product.findByPk(id, { 
        include: [
            { model: User, as: 'creator', attributes: ['name'] },
            { model: User, as: 'editor', attributes: ['name'] },
            { 
                model: Category, 
                as: 'category', 
                include: [{ model: Category, as: 'parent', attributes: ['name'] }] 
            },
            { model: ProductImage, as: 'images' },
            {
                model: ProductVideo,
                as: 'videos',
                attributes: ['id', 'provider', 'video_url', 'external_id', 'thumbnail_url', 'title', 'duration', 'is_primary', 'sort_order']
            },
            {
                model: ProductVariant,
                as: 'variants'
            },
            { 
                model: ProductAttribute, 
                as: 'attributeValues',
                include: [{ model: AttributeTemplate, as: 'template', attributes: ['id', 'name', 'type'] }]
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
    return await Product.update(data, { where: { id }, transaction });
};

export const updateAll = async (data, whereClause, transaction) => {
    return await Product.update(data, { 
        where: whereClause,
        transaction 
    });
};

export const remove = async (id, transaction) => {
    return await Product.destroy({ where: { id }, transaction });
};

export const softDelete = async (id, userId, transaction) => {
    await Product.update({ deleted_by: userId }, { where: { id }, transaction });
    return await Product.destroy({ where: { id }, transaction });
};