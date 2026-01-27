import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import User from './userModel.js';
import Category from './categoryModel.js';
import ProductImage from './productImageModel.js';

const Product = db.define('product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { notEmpty: true }
    },
    price: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
        validate: { isDecimal: true, min: 0 }
    },
    description: { type: DataTypes.TEXT },
    brand: { type: DataTypes.STRING },
    category_id: {
        type: DataTypes.INTEGER,
        references: { model: 'categories', key: 'id' }
    },
    countInStock: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        validate: { min: 0 }
    },
    created_by: { 
        type: DataTypes.INTEGER,
        references: { model: 'users', key: 'id' }
    },
    updated_by: { 
        type: DataTypes.INTEGER,
        references: { model: 'users', key: 'id' }
    },
    deleted_by: { 
        type: DataTypes.INTEGER,
        references: { model: 'users', key: 'id' }
    }
}, {
    underscored: true,
    timestamps: true,
    paranoid: true 
});

Product.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Product.belongsTo(User, { as: 'editor', foreignKey: 'updated_by' });
Product.belongsTo(User, { as: 'remover', foreignKey: 'deleted_by' });

Product.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Product.hasMany(ProductImage, { as: 'images', foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

export default Product;