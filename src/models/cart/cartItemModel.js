import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const CartItem = db.define('cart_item', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cart_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'carts', key: 'id' }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    underscored: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['cart_id', 'product_id']
        }
    ]
});

export default CartItem;