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
                const field = err.path.join('.').replace(/^(body\.|query\.|params\.)/, '');
                return `${field}: ${err.message}`;
            });

            return next(new ApiError(errorMessages.join(' | '), 400));
        }

        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = result.data.params;

        next();
    } catch (error) {
        next(new ApiError('Validation Internal Error', 500));
    }
};

export default validate;