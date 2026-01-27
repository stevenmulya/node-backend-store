import * as userService from '../services/userService.js';
import sendResponse from '../utils/ApiResponse.js';

export const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await userService.loginUser(email, password);
        sendResponse(res, 200, 'Login successful', data);
    } catch (error) {
        next(error);
    }
};

export const registerUser = async (req, res, next) => {
    try {
        const data = await userService.registerUser(req.body);
        sendResponse(res, 201, 'User registered successfully', data);
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req, res, next) => {
    try {
        const data = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            level: req.user.level
        };
        sendResponse(res, 200, 'User profile retrieved', data);
    } catch (error) {
        next(error);
    }
};