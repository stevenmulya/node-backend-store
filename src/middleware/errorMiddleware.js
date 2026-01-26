const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // Default to 500 if status code is 200
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // --- CUSTOM DATABASE ERRORS (MySQL) ---
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        statusCode = 500;
        message = 'Database Error: Access denied. Invalid username or password.';
    }
    if (err.code === 'ECONNREFUSED') {
        statusCode = 500;
        message = 'Database Error: Connection refused. Is the database server running?';
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
        statusCode = 500;
        message = `Database Error: Database '${process.env.DB_NAME}' not found.`;
    }

    // --- JWT AUTH ERRORS ---
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Unauthorized: Invalid token.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Unauthorized: Token expired. Please login again.';
    }

    // --- FINAL RESPONSE ---
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Stack trace visible only in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };