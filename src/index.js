import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import db from './config/database.js';
import specs from './config/swagger.js';

import { initAssociations } from './models/associations.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// --- 1. SECURITY HEADERS (HELMET) ---
// FIX: Izinkan Cross-Origin agar Frontend (Port 3000) bisa akses Backend (Port 5000)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- 2. CORS (PENTING: Taruh di atas Rate Limit) ---
// Agar browser "Preflight Check" (OPTIONS) lolos duluan sebelum dicek limiter
app.use(cors());

// --- 3. RATE LIMITER ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        status: 429,
        message: 'Too many login attempts, please try again after 1 hour'
    }
});
// Terapkan limiter khusus user
app.use('/api/users', authLimiter);

// --- 4. PARSER ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- 5. ROUTES ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/users', userRoutes); // User routes ditaruh disini
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- 6. ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await db.authenticate();
        initAssociations();
        
        await db.sync(); 
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Unable to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();