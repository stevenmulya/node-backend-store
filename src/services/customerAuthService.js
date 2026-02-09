import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as customerRepo from '../repositories/customerRepository.js';
import CustomerResponse from '../models/customer/customerResponseModel.js';
import CustomerAddress from '../models/customer/customerAddressModel.js';
import { sendVerificationEmail } from '../utils/emailSender.js';
import db from '../config/database.js';
import ApiError from '../utils/ApiError.js';

const validateSurveyResponses = async (responses) => {
    const activeFields = await customerRepo.getActiveFormFields();
    
    for (const field of activeFields) {
        if (field.is_required) {
            const userResponse = responses.find(r => r.field_id === field.id);
            if (!userResponse || !userResponse.answer) {
                throw new ApiError(`Field '${field.label}' is required`, 400);
            }
        }
    }
    return true;
};

export const getCustomersList = async (params) => {
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const search = params.search || '';
    const sort = params.sort || 'newest';
    const { count, rows } = await customerRepo.findAll({ page, limit, search, sort });
    return {
        data: rows,
        meta: {
            total_data: count,
            total_pages: Math.ceil(count / limit),
            current_page: page,
            per_page: limit
        }
    };
};

export const getCustomerById = async (id) => {
    const customer = await customerRepo.findById(id);
    if (!customer) throw new ApiError('Customer not found', 404);
    return customer;
};

export const removeCustomer = async (id) => {
    const deleted = await customerRepo.deleteById(id);
    if (!deleted) throw new ApiError('Customer not found', 404);
    return true;
};

export const registerCustomer = async (payload) => {
    const transaction = await db.transaction();
    try {
        const { name, email, password, phone, survey_responses, addresses } = payload;

        const existing = await customerRepo.findByEmail(email);
        if (existing) throw new ApiError('Email already registered', 400);

        await validateSurveyResponses(survey_responses || []);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

        const newCustomer = await customerRepo.create({
            name,
            email,
            phone,
            password: hashedPassword,
            is_verified: false,
            verification_token: verifyToken,
            verification_token_expires: tokenExpires
        }, { transaction });

        if (survey_responses && Array.isArray(survey_responses)) {
            const responseData = survey_responses.map(resp => ({
                customer_id: newCustomer.id,
                field_id: resp.field_id,
                answer: resp.answer
            }));
            await CustomerResponse.bulkCreate(responseData, { transaction });
        }

        if (addresses && Array.isArray(addresses) && addresses.length > 0) {
            const addressData = addresses.map(addr => ({
                customer_id: newCustomer.id,
                label: addr.label || 'Home',
                recipient_name: addr.recipient_name || name,
                phone: addr.phone || phone,
                country: addr.country || 'Indonesia',
                state: addr.state,
                city: addr.city,
                district: addr.district,
                postal_code: addr.postal_code,
                full_address: addr.full_address,
                note: addr.note,
                is_primary: addr.is_primary || false
            }));
            await CustomerAddress.bulkCreate(addressData, { transaction });
        }

        await sendVerificationEmail(email, name, verifyToken);
        await transaction.commit();
        
        return { 
            id: newCustomer.id, 
            email: newCustomer.email,
            message: "Registration successful. Please verify your email." 
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const verifyEmailToken = async (token) => {
    const customer = await customerRepo.findByVerificationToken(token);
    if (!customer) throw new ApiError('Invalid or expired verification token', 400);
    customer.is_verified = true;
    customer.verification_token = null;
    customer.verification_token_expires = null;
    await customer.save();
    return { success: true, message: "Email verified. You can now login." };
};

export const resendVerification = async (email) => {
    const customer = await customerRepo.findByEmail(email);
    if (!customer) throw new ApiError('Email not found', 404);
    if (customer.is_verified) throw new ApiError('Account already verified', 400);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    customer.verification_token = verifyToken;
    customer.verification_token_expires = tokenExpires;
    await customer.save();
    await sendVerificationEmail(customer.email, customer.name, verifyToken);
    return { message: "Verification link resent." };
};

export const loginCustomer = async (email, password) => {
    const customer = await customerRepo.findByEmail(email);
    if (!customer) throw new ApiError('Invalid email or password', 401);
    if (!customer.is_active) throw new ApiError('Account is inactive', 403);
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new ApiError('Invalid email or password', 401);
    const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    customer.update({ last_login_at: new Date() });
    return { token, user: { id: customer.id, name: customer.name, email: customer.email } };
};