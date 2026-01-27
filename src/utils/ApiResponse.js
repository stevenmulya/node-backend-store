const sendResponse = (res, statusCode, message, data = null, meta = null) => {
    res.status(statusCode).json({
        success: statusCode < 400,
        message,
        data,
        meta
    });
};

export default sendResponse;