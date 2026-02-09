import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const ProductAttribute = db.define('product_attribute', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    attribute_template_id: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
}, { 
    underscored: true,
    tableName: 'product_attributes' 
});

export default ProductAttribute;