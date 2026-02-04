import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await userRepo.findById(decoded.id);

            if (!user) {
                return next(new ApiError('User associated with this token no longer exists', 401));
            }

            const userObj = user.toJSON ? user.toJSON() : user;
            delete userObj.password;

            req.user = userObj;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(new ApiError('Session expired, please login again', 401));
            }
            return next(new ApiError('Not authorized, token invalid', 401));
        }
    } else {
        return next(new ApiError('Not authorized, no token provided', 401));
    }
};

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.level || req.user.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (roles.includes(userRole) || userRole >= Math.max(...roles)) {
            next();
        } else {
            next(new ApiError('Access denied: Insufficient permissions', 403));
        }
    };
};