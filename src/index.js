import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import db from './config/database.js';
import specs from './config/swagger.js';

import { initAssociations } from './models/associations.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? [process.env.CLIENT_URL] 
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const apiV1 = express.Router();

apiV1.use('/users', userRoutes);
apiV1.use('/products', productRoutes);
apiV1.use('/categories', categoryRoutes);
apiV1.use('/customers', customerRoutes);
apiV1.use('/orders', orderRoutes);

app.use('/api/v1', apiV1);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send(`API Service is running in ${NODE_ENV} mode.`);
});

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
    try {
        await db.authenticate();
        
        initAssociations();
        
        if (NODE_ENV === 'development') {
            await db.sync({ alter: true });
        }

        server = app.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
        });

    } catch (error) {
        console.error(`Unable to start server: ${error.message}`);
        process.exit(1);
    }
};

const gracefulShutdown = () => {
    if (server) {
        server.close(() => {
            db.close().then(() => {
                process.exit(0);
            });
        });
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();