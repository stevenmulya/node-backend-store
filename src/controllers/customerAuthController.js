// import * as authService from '../services/customerAuthService.js';
// import * as customerRepo from '../repositories/customerRepository.js';
// import sendResponse from '../utils/ApiResponse.js';
// import asyncHandler from '../utils/asyncHandler.js';

// export const getCustomers = asyncHandler(async (req, res) => {
//     const result = await authService.getCustomersList(req.query);
//     sendResponse(res, 200, 'Customers retrieved successfully', result.data, result.meta);
// });

// export const getCustomer = asyncHandler(async (req, res) => {
//     const customer = await authService.getCustomerById(req.params.id);
//     sendResponse(res, 200, 'Customer detail retrieved', customer);
// });

// export const deleteCustomer = asyncHandler(async (req, res) => {
//     await authService.removeCustomer(req.params.id);
//     sendResponse(res, 200, 'Customer deleted successfully');
// });

// export const getRegistrationForm = asyncHandler(async (req, res) => {
//     const fields = await customerRepo.getActiveFormFields();
//     sendResponse(res, 200, 'Form fields retrieved', fields);
// });

// export const register = asyncHandler(async (req, res) => {
//     const data = await authService.registerCustomer(req.body);
//     sendResponse(res, 201, 'Registration successful', data);
// });

// export const verifyEmail = asyncHandler(async (req, res) => {
//     const { token } = req.query; 
//     if (!token) return sendResponse(res, 400, 'Token is required');
//     const result = await authService.verifyEmailToken(token);
//     sendResponse(res, 200, result.message);
// });

// export const resendEmail = asyncHandler(async (req, res) => {
//     const { email } = req.body;
//     const result = await authService.resendVerification(email);
//     sendResponse(res, 200, result.message);
// });

// export const login = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     const data = await authService.loginCustomer(email, password);
//     sendResponse(res, 200, 'Login successful', data);
// });