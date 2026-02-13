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
    const user = req.user;
    const data = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.role === 'CUSTOMER' ? user.customerProfile : user.adminProfile
    };
    sendResponse(res, 200, 'User profile retrieved', data);
});

export const getUsers = asyncHandler(async (req, res) => {
    const data = await userService.getAllUsers(req.query);
    sendResponse(res, 200, 'Users retrieved successfully', data);
});