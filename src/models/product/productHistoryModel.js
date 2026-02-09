import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const ProductHistory = db.define('product_history', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.ENUM('CREATED', 'UPDATED', 'DELETED'), allowNull: false },
    performed_by: { type: DataTypes.INTEGER, allowNull: false },
    details: { type: DataTypes.JSON, defaultValue: {} },
    product_name_at_time: { type: DataTypes.STRING }
}, { underscored: true, timestamps: true, updatedAt: false });

export default ProductHistory;