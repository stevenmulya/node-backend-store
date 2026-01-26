import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js'; // 1. IMPORT INI
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const initDatabase = async () => {
    try {
        // Init Table Users
        const userQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                isAdmin TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(userQuery);

        // Init Table Products (TAMBAHAN PENTING AGAR TIDAK ERROR DATABASE)
        const productQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                brand VARCHAR(255),
                category VARCHAR(255),
                countInStock INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(productQuery);

        console.log("Database initialized (Users & Products tables ready)");
    } catch (error) {
        console.error("Database initialization failed:", error.message);
    }
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // 2. DAFTARKAN ROUTE DI SINI

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
initDatabase().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});