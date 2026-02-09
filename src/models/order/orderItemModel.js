import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const OrderItem = db.define('order_item', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'products', key: 'id' }
    },
    snap_product_name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    snap_product_sku: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    snap_product_price: { 
        type: DataTypes.DECIMAL(19, 2), 
        allowNull: false 
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    total_line_price: {
        type: DataTypes.DECIMAL(19, 2),
        allowNull: false
    }
}, {
    underscored: true,
    timestamps: true
});

export default OrderItem;