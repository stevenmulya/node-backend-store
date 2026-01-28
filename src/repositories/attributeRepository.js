import AttributeTemplate from '../models/attributeTemplateModel.js';
import ProductAttribute from '../models/productAttributeModel.js';

export const findTemplatesByCategoryId = async (categoryId) => {
    return await AttributeTemplate.findAll({ where: { category_id: categoryId } });
};

export const findAllTemplates = async () => {
    return await AttributeTemplate.findAll();
};

export const upsertTemplates = async (categoryId, fields, transaction) => {
    await AttributeTemplate.destroy({ where: { category_id: categoryId }, transaction });
    return await AttributeTemplate.bulkCreate(
        fields.map(f => ({ ...f, category_id: categoryId })),
        { transaction }
    );
};

export const bulkCreateValues = async (data, transaction) => {
    return await ProductAttribute.bulkCreate(data, { transaction });
};

export const deleteValuesByProductId = async (productId, transaction) => {
    return await ProductAttribute.destroy({ where: { product_id: productId }, transaction });
};