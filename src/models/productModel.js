import { DataTypes } from 'sequelize';
import db from '../config/database.js';

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

export default Product;