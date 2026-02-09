import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const ProductVariant = db.define('product_variant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    options: { type: DataTypes.JSON, allowNull: false },
    price: { type: DataTypes.DECIMAL(19, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
    weight: { type: DataTypes.INTEGER, defaultValue: 0 },
    length: { type: DataTypes.INTEGER, defaultValue: 0 },
    width: { type: DataTypes.INTEGER, defaultValue: 0 },
    height: { type: DataTypes.INTEGER, defaultValue: 0 },
    image_url: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    underscored: true,
    timestamps: true,
    indexes: [{ fields: ['product_id', 'sku'] }]
});

export default ProductVariant;