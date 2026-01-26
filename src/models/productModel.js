import db from '../config/database.js';

const Product = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, u.name as creator_name 
            FROM products p
            LEFT JOIN users u ON p.created_by = u.id
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, price, description, image, createdBy } = data;
        const [result] = await db.query(
            'INSERT INTO products (name, price, description, image, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)', 
            [name, price, description, image, createdBy, createdBy]
        );
        return result.insertId;
    }
};

export default Product;