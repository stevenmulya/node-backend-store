import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const Cart = db.define('cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'customers', key: 'id' }
    }
}, {
    underscored: true,
    timestamps: true
});

export default Cart;