import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const CustomerAddress = db.define('customer_address', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    label: { 
        type: DataTypes.STRING,
        defaultValue: 'Home'
    },
    recipient_name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    phone: { 
        type: DataTypes.STRING(20), 
        allowNull: false 
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Indonesia'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    district: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postal_code: { 
        type: DataTypes.STRING(10), 
        allowNull: false 
    },
    full_address: { 
        type: DataTypes.TEXT, 
        allowNull: false
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_primary: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    }
}, { 
    underscored: true,
    timestamps: true,
    indexes: [
        {
            fields: ['customer_id']
        }
    ]
});

export default CustomerAddress;