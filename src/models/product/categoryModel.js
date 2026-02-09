import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const Category = db.define('category', {
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
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' }
    }
}, {
    underscored: true,
    timestamps: true
});

export default Category;