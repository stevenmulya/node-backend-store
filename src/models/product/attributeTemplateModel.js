import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const AttributeTemplate = db.define('attribute_template', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('text', 'number', 'color'), defaultValue: 'text' }
}, { underscored: true });

export default AttributeTemplate;