import User from './userModel.js';
import Product from './productModel.js';
import Category from './categoryModel.js';
import ProductImage from './productImageModel.js';
import AttributeTemplate from './attributeTemplateModel.js';
import ProductAttribute from './productAttributeModel.js';
import ProductHistory from './productHistoryModel.js';

export const initAssociations = () => {
    Product.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
    Product.belongsTo(User, { as: 'editor', foreignKey: 'updated_by' });
    Product.belongsTo(User, { as: 'remover', foreignKey: 'deleted_by' });
    Product.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
    Product.hasMany(ProductImage, { as: 'images', foreignKey: 'product_id', onDelete: 'CASCADE' });
    
    Category.hasMany(Product, { foreignKey: 'category_id' });
    Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
    Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
    
    Category.hasMany(AttributeTemplate, { as: 'templates', foreignKey: 'category_id', onDelete: 'CASCADE' });
    AttributeTemplate.belongsTo(Category, { foreignKey: 'category_id' });

    Product.hasMany(ProductAttribute, { as: 'attributeValues', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductAttribute.belongsTo(Product, { foreignKey: 'product_id' });
    ProductAttribute.belongsTo(AttributeTemplate, { as: 'template', foreignKey: 'attribute_template_id' });

    Product.hasMany(ProductHistory, { as: 'histories', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductHistory.belongsTo(Product, { foreignKey: 'product_id' });
    ProductHistory.belongsTo(User, { as: 'performer', foreignKey: 'performed_by' });
};