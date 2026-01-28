import { Op } from 'sequelize';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import ProductImage from '../models/productImageModel.js';
import ProductAttribute from '../models/productAttributeModel.js';
import AttributeTemplate from '../models/attributeTemplateModel.js';

export const buildInventoryQuery = (filters) => {
    const { category_id, search, ...dynamicAttributes } = filters;
    let where = {};
    
    if (category_id && category_id !== 'all') {
        where.category_id = category_id;
    }

    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    let include = [
        { model: User, as: 'creator', attributes: ['name', 'level'] },
        { model: User, as: 'editor', attributes: ['name', 'level'] },
        { model: Category, as: 'category', include: [{ model: Category, as: 'parent' }] },
        { model: ProductImage, as: 'images' },
        { 
            model: ProductAttribute, 
            as: 'attributeValues',
            include: [{ model: AttributeTemplate, as: 'template' }]
        }
    ];

    if (Object.keys(dynamicAttributes).length > 0) {
        Object.entries(dynamicAttributes).forEach(([key, val]) => {
            if (val) {
                include.push({
                    model: ProductAttribute,
                    as: 'attributeValues',
                    where: { value: val },
                    include: [{ model: AttributeTemplate, where: { name: key } }]
                });
            }
        });
    }

    return { where, include, order: [['createdAt', 'DESC']] };
};