import ApiError from '../utils/ApiError.js';

export const requireAdminLevel = (minLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError('Unauthorized. Please login first.', 401);
        }

        const userLevel = req.user.level || 0;

        if (userLevel < minLevel) {
            throw new ApiError(`Forbidden. Access requires Admin Level ${minLevel}.`, 403);
        }

        next();
    };
};