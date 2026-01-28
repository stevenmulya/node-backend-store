import AttributeTemplate from '../models/attributeTemplateModel.js';
import ProductAttribute from '../models/productAttributeModel.js';
import * as categoryRepo from '../repositories/categoryRepository.js';
import { Op } from 'sequelize';

export const getTemplates = async (categoryId) => {
    const ancestorIds = await categoryRepo.getAncestors(categoryId);
    return await AttributeTemplate.findAll({ 
        where: { category_id: { [Op.in]: ancestorIds } },
        order: [['category_id', 'ASC']]
    });
};

export const getAllTemplates = () => {
    return AttributeTemplate.findAll({ order: [['category_id', 'ASC']] });
};

export const updateTemplates = async (categoryId, fields, transaction) => {
    await AttributeTemplate.destroy({ where: { category_id: categoryId }, transaction });
    return await AttributeTemplate.bulkCreate(
        fields.map(f => ({ ...f, category_id: categoryId })),
        { transaction }
    );
};

export const syncProductAttributes = async (productId, attributes, transaction) => {
    await ProductAttribute.destroy({ where: { product_id: productId }, transaction });
    if (attributes) {
        const parsed = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        const payload = Object.entries(parsed).map(([templateId, val]) => ({
            product_id: productId,
            attribute_template_id: templateId,
            value: String(val)
        }));
        await ProductAttribute.bulkCreate(payload, { transaction });
    }
};