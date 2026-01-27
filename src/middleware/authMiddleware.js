import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await userRepo.findById(decoded.id);
            
            if (!req.user) {
                return next(new ApiError('User no longer exists', 404));
            }
            
            next();
        } catch (error) {
            next(new ApiError('Not authorized, token failed', 401));
        }
    } else {
        next(new ApiError('Not authorized, no token', 401));
    }
};

export const authorize = (minLevel) => {
    return (req, res, next) => {
        if (req.user && req.user.level >= minLevel) {
            next();
        } else {
            next(new ApiError(`Access denied. Minimum level ${minLevel} required`, 403));
        }
    };
};