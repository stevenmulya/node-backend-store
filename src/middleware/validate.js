import ApiError from '../utils/ApiError.js';

const validate = (schema) => async (req, res, next) => {
    try {
        const result = await schema.safeParseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            const errorMessages = result.error.errors.map((err) => {
                const path = err.path.join('.').replace(/^(body\.|query\.|params\.)/, '');
                return `${path}: ${err.message}`;
            });

            const message = errorMessages.join(', ');
            return next(new ApiError(message, 400));
        }

        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = result.data.params;

        next();
    } catch (error) {
        next(error);
    }
};

export default validate;