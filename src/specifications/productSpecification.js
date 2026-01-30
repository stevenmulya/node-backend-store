import { Op } from 'sequelize';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import ProductImage from '../models/productImageModel.js';
import ProductAttribute from '../models/productAttributeModel.js';
import AttributeTemplate from '../models/attributeTemplateModel.js';
import ProductVideo from '../models/productVideoModel.js';
import ProductVariant from '../models/productVariantModel.js';

export const buildInventoryQuery = (filters) => {
    const { category_id, search, page, limit, sort, low_stock, ...dynamicAttributes } = filters;
    let where = {};
    
    if (category_id && category_id !== 'all') {
        where.category_id = category_id;
    }

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { brand: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } }
        ];
    }

    if (low_stock === 'true') {
        where.stock = { [Op.lt]: 5 };
    }

    let include = [
        { model: User, as: 'creator', attributes: ['name', 'level'] },
        { model: User, as: 'editor', attributes: ['name', 'level'] },
        { model: Category, as: 'category', include: [{ model: Category, as: 'parent', attributes: ['name'] }] },
        { model: ProductImage, as: 'images' },
        { model: ProductVideo, as: 'videos' },
        { model: ProductVariant, as: 'variants' },
        { 
            model: ProductAttribute, 
            as: 'attributeValues',
            include: [{ model: AttributeTemplate, as: 'template', attributes: ['name'] }]
        }
    ];

    if (Object.keys(dynamicAttributes).length > 0) {
        Object.entries(dynamicAttributes).forEach(([key, val]) => {
            if (val) {
                include.push({
                    model: ProductAttribute,
                    as: 'attributeValues',
                    where: { value: val },
                    include: [{ 
                        model: AttributeTemplate, 
                        as: 'template',
                        where: { name: key } 
                    }]
                });
            }
        });
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'oldest') {
        order = [['createdAt', 'ASC']];
    }

    return { where, include, order };
};