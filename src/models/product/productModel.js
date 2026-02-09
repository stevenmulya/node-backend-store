import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

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
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    product_type: {
        type: DataTypes.ENUM('simple', 'variable'),
        defaultValue: 'simple',
        allowNull: false
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_best_seller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    similarities: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: { 
        type: DataTypes.DECIMAL(19, 2), 
        allowNull: false,
        validate: { isDecimal: true, min: 0 }
    },
    description: { type: DataTypes.TEXT },
    brand: { type: DataTypes.STRING },
    weight: { type: DataTypes.INTEGER, defaultValue: 0 },
    length: { type: DataTypes.INTEGER, defaultValue: 0 },
    width: { type: DataTypes.INTEGER, defaultValue: 0 },
    height: { type: DataTypes.INTEGER, defaultValue: 0 },
    category_id: {
        type: DataTypes.INTEGER,
        references: { model: 'categories', key: 'id' }
    },
    stock: { 
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
    paranoid: true,
    indexes: [
        { name: 'product_category_idx', fields: ['category_id'] },
        { name: 'product_status_idx', fields: ['is_published', 'is_pinned', 'is_best_seller'] },
        { name: 'product_brand_idx', fields: ['brand'] },
        { name: 'product_created_at_idx', fields: ['created_at'] }
    ]
});

export default Product;