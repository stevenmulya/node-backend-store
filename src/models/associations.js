import User from './userModel.js';
import Product from './productModel.js';
import Category from './categoryModel.js';
import ProductImage from './productImageModel.js';
import AttributeTemplate from './attributeTemplateModel.js';
import ProductAttribute from './productAttributeModel.js';
import ProductHistory from './productHistoryModel.js';
import ProductVideo from './productVideoModel.js';
import ProductVariant from './productVariantModel.js';
import Customer from './customerModel.js';
import CustomerAddress from './customerAddressModel.js';
import CustomerFormField from './customerFormFieldModel.js';
import CustomerResponse from './customerResponseModel.js';

export const initAssociations = () => {
    Product.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
    Product.belongsTo(User, { as: 'editor', foreignKey: 'updated_by' });
    Product.belongsTo(User, { as: 'remover', foreignKey: 'deleted_by' });
    Product.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
    
    Product.hasMany(ProductImage, { as: 'images', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductImage.belongsTo(Product, { foreignKey: 'product_id' });
    
    Product.hasMany(ProductVideo, { as: 'videos', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductVideo.belongsTo(Product, { foreignKey: 'product_id' });

    Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

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

    Customer.hasMany(CustomerAddress, { as: 'addresses', foreignKey: 'customer_id', onDelete: 'CASCADE' });
    CustomerAddress.belongsTo(Customer, { foreignKey: 'customer_id' });

    Customer.hasMany(CustomerResponse, { as: 'responses', foreignKey: 'customer_id', onDelete: 'CASCADE' });
    CustomerResponse.belongsTo(Customer, { foreignKey: 'customer_id' });

    CustomerFormField.hasMany(CustomerResponse, { as: 'fieldResponses', foreignKey: 'field_id', onDelete: 'CASCADE' });
    CustomerResponse.belongsTo(CustomerFormField, { as: 'field', foreignKey: 'field_id' });
};