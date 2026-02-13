import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import { PrismaClient } from '@prisma/client';

import userRoutes from './routes/userRoutes.js';
// IMPORT ITEM ROUTE BARU
import itemRoutes from './routes/itemRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
    origin: NODE_ENV === 'production' ? [process.env.CLIENT_URL] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const apiV1 = express.Router();

apiV1.use('/users', userRoutes);
// DAFTARKAN ITEM ROUTE DI SINI
apiV1.use('/items', itemRoutes);

/* HIDE OTHER ROUTES UNTIL REFACTORED TO PRISMA
  apiV1.use('/categories', categoryRoutes);
  apiV1.use('/customers', customerRoutes);
  apiV1.use('/orders', orderRoutes);
*/

app.use('/api/v1', apiV1);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully via Prisma');

        server = app.listen(PORT, () => {
            console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`🔗 Users: http://localhost:${PORT}/api/v1/users`);
            console.log(`🔗 Items: http://localhost:${PORT}/api/v1/items`);
        });
    } catch (error) {
        console.error(`❌ Unable to start server: ${error.message}`);
        process.exit(1);
    }
};

const gracefulShutdown = async () => {
    if (server) {
        server.close(async () => {
            await prisma.$disconnect();
            console.log('🛑 Server and Database disconnected.');
            process.exit(0);
        });
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();