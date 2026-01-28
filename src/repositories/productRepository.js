import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import ProductImage from '../models/productImageModel.js';
import ProductAttribute from '../models/productAttributeModel.js';
import AttributeTemplate from '../models/attributeTemplateModel.js';

const defaultInclude = [
    { model: User, as: 'creator', attributes: ['name'] },
    { model: User, as: 'editor', attributes: ['name'] },
    { 
        model: Category, 
        as: 'category', 
        include: [{ model: Category, as: 'parent', attributes: ['name'] }] 
    },
    { model: ProductImage, as: 'images' },
    { 
        model: ProductAttribute, 
        as: 'attributeValues',
        include: [{ model: AttributeTemplate, as: 'template', attributes: ['name'] }]
    }
];

export const findAll = async (specification = {}) => {
    return await Product.findAll({
        where: specification.where || {},
        include: defaultInclude,
        order: [['createdAt', 'DESC']]
    });
};

export const findById = async (id) => {
    return await Product.findByPk(id, { include: defaultInclude });
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

export const softDelete = async (id, userId, transaction) => {
    await Product.update({ deleted_by: userId }, { where: { id }, transaction });
    return await Product.destroy({ where: { id }, transaction });
};