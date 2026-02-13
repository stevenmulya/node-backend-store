import ApiError from '../utils/ApiError.js';

const notFound = (req, res, next) => {
    next(new ApiError(`Not Found - ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    if (err.code === 'P2002') {
        statusCode = 400;
        message = `Duplicate field value: ${err.meta.target}. Data already exists.`;
    }

    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record to update or delete not found.';
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please log in again.';
    }

    if (statusCode === 500) {
        console.error('--- INTERNAL ERROR ---');
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export { notFound, errorHandler };