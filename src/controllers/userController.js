import * as userService from '../services/userService.js';
import sendResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const data = await userService.loginUser(email, password);
    sendResponse(res, 200, 'Login successful', data);
});

export const registerUser = asyncHandler(async (req, res) => {
    const data = await userService.registerUser(req.body);
    sendResponse(res, 201, 'User registered successfully', data);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const data = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        level: req.user.level
    };
    sendResponse(res, 200, 'User profile retrieved', data);
});