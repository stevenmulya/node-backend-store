import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const CustomerResponse = db.define('customer_response', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    field_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { 
    underscored: true,
    timestamps: true 
});

export default CustomerResponse;