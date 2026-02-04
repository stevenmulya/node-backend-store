import ApiError from '../utils/ApiError.js';

const notFound = (req, res, next) => {
    next(new ApiError(`Not Found - ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = err.errors.map((e) => e.message).join(', ');
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Duplicate field value entered. Data already exists.';
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