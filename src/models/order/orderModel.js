import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const Order = db.define('order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' }
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    order_status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'),
        defaultValue: 'pending',
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'failed', 'refunded'),
        defaultValue: 'unpaid',
        allowNull: false
    },
    total_items_price: {
        type: DataTypes.DECIMAL(19, 2),
        allowNull: false,
        defaultValue: 0
    },
    shipping_cost: {
        type: DataTypes.DECIMAL(19, 2),
        allowNull: false,
        defaultValue: 0
    },
    total_amount: {
        type: DataTypes.DECIMAL(19, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_provider: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    snap_recipient_name: { type: DataTypes.STRING, allowNull: false },
    snap_phone: { type: DataTypes.STRING, allowNull: false },
    snap_full_address: { type: DataTypes.TEXT, allowNull: false },
    snap_city: { type: DataTypes.STRING, allowNull: false },
    snap_postal_code: { type: DataTypes.STRING, allowNull: false },
    snap_province: { type: DataTypes.STRING, allowNull: true },
    snap_country: { type: DataTypes.STRING, defaultValue: 'Indonesia' },
    shipping_courier: { type: DataTypes.STRING, allowNull: true },
    tracking_number: { type: DataTypes.STRING, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true }
}, {
    underscored: true,
    timestamps: true,
    indexes: [
        { fields: ['customer_id'] },
        { fields: ['invoice_number'] },
        { fields: ['created_at'] }
    ]
});

export default Order;