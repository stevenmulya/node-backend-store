import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const CustomerFormField = db.define('customer_form_field', {
    label: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    field_key: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    options: { 
        type: DataTypes.JSON, 
        allowNull: false 
    },
    is_required: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    is_active: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, { 
    underscored: true,
    timestamps: true 
});

export default CustomerFormField;