import User from './user/userModel.js';
import Product from './product/productModel.js';
import Category from './product/categoryModel.js';
import ProductImage from './product/productImageModel.js';
import AttributeTemplate from './product/attributeTemplateModel.js';
import ProductAttribute from './product/productAttributeModel.js';
import ProductHistory from './product/productHistoryModel.js';
import ProductVideo from './product/productVideoModel.js';
import ProductVariant from './product/productVariantModel.js';
import Customer from './customer/customerModel.js';
import CustomerAddress from './customer/customerAddressModel.js';
import CustomerFormField from './customer/customerFormFieldModel.js';
import CustomerResponse from './customer/customerResponseModel.js';
import Cart from './cart/cartModel.js';
import CartItem from './cart/cartItemModel.js';
import Order from './order/orderModel.js';
import OrderItem from './order/orderItemModel.js';

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
    AttributeTemplate.hasMany(ProductAttribute, { foreignKey: 'attribute_template_id' });

    Product.hasMany(ProductHistory, { as: 'histories', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductHistory.belongsTo(Product, { foreignKey: 'product_id' });
    ProductHistory.belongsTo(User, { as: 'performer', foreignKey: 'performed_by' });

    Customer.hasMany(CustomerAddress, { as: 'addresses', foreignKey: 'customer_id', onDelete: 'CASCADE' });
    CustomerAddress.belongsTo(Customer, { foreignKey: 'customer_id' });

    Customer.hasMany(CustomerResponse, { as: 'responses', foreignKey: 'customer_id', onDelete: 'CASCADE' });
    CustomerResponse.belongsTo(Customer, { foreignKey: 'customer_id' });

    CustomerFormField.hasMany(CustomerResponse, { as: 'fieldResponses', foreignKey: 'field_id', onDelete: 'CASCADE' });
    CustomerResponse.belongsTo(CustomerFormField, { as: 'field', foreignKey: 'field_id' });

    Customer.hasOne(Cart, { as: 'cart', foreignKey: 'customer_id', onDelete: 'CASCADE' });
    Cart.belongsTo(Customer, { as: 'customer', foreignKey: 'customer_id' });

    Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cart_id', onDelete: 'CASCADE' });
    CartItem.belongsTo(Cart, { as: 'cart', foreignKey: 'cart_id' });

    Product.hasMany(CartItem, { foreignKey: 'product_id' });
    CartItem.belongsTo(Product, { as: 'product', foreignKey: 'product_id' });

    Customer.hasMany(Order, { as: 'orders', foreignKey: 'customer_id' });
    Order.belongsTo(Customer, { as: 'customer', foreignKey: 'customer_id' });

    Order.hasMany(OrderItem, { as: 'items', foreignKey: 'order_id', onDelete: 'CASCADE' });
    OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'order_id' });

    Product.hasMany(OrderItem, { foreignKey: 'product_id' });
    OrderItem.belongsTo(Product, { as: 'productReference', foreignKey: 'product_id' });
};