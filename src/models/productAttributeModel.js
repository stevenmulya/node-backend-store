import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const ProductAttribute = db.define('product_attribute', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    product_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field: 'product_id'
    },
    attribute_template_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field: 'attribute_template_id' 
    },
    value: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }
}, { 
    underscored: true,
    tableName: 'product_attributes' 
});

export default ProductAttribute;