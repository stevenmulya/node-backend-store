import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Customer = db.define('customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verification_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_login_at: {
        type: DataTypes.DATE
    }
}, {
    underscored: true,
    timestamps: true
});

export default Customer;