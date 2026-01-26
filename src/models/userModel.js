import db from '../config/database.js';

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT id, name, email, isAdmin FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (userData) => {
        const { name, email, password, isAdmin } = userData;
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
            [name, email, password, isAdmin || false]
        );
        return result.insertId;
    }
};

export default User;