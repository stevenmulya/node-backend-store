import { DataTypes } from 'sequelize';
import db from '../../config/database.js';

const ProductVideo = db.define('product_video', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
    provider: { type: DataTypes.STRING(50), defaultValue: 'youtube', allowNull: false },
    video_url: { type: DataTypes.STRING(500), allowNull: false },
    external_id: { type: DataTypes.STRING(100), allowNull: true },
    thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    duration: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    underscored: true,
    timestamps: true,
    indexes: [{ fields: ['product_id', 'sort_order'] }]
});

export default ProductVideo;