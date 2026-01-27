import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const ProductImage = db.define('product_image', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    underscored: true,
    timestamps: true
});

export default ProductImage;