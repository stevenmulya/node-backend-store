import { jest } from '@jest/globals';

jest.mock('../src/config/database.js', () => ({
    __esModule: true,
    default: {
        transaction: jest.fn(),
        define: jest.fn().mockReturnValue({
            belongsTo: jest.fn(),
            hasMany: jest.fn(),
            hasOne: jest.fn()
        })
    }
}));

jest.mock('../src/models/customerResponseModel.js', () => ({
    __esModule: true,
    default: {
        bulkCreate: jest.fn().mockResolvedValue(true)
    }
}));

jest.mock('../src/models/customerAddressModel.js', () => ({
    __esModule: true,
    default: {
        bulkCreate: jest.fn().mockResolvedValue(true)
    }
}));

jest.mock('../src/utils/emailSender.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/repositories/customerRepository.js'); 
jest.mock('crypto');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn()
    })
}));

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as customerRepo from '../src/repositories/customerRepository.js';
import CustomerResponse from '../src/models/customerResponseModel.js';
import CustomerAddress from '../src/models/customerAddressModel.js';
import { sendVerificationEmail } from '../src/utils/emailSender.js';
import db from '../src/config/database.js';
import * as service from '../src/services/customerAuthService.js';

describe('Customer Auth Service Unit Tests', () => {
    
    let mockTransaction;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };
        db.transaction.mockResolvedValue(mockTransaction);
    });

    describe('getCustomersList', () => {
        it('should return paginated customer list', async () => {
            const mockData = { 
                count: 20, 
                rows: [{ id: 1 }, { id: 2 }] 
            };
            customerRepo.findAll.mockResolvedValue(mockData);

            const result = await service.getCustomersList({ page: 1, limit: 10 });

            expect(customerRepo.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: '',
                sort: 'newest'
            });
            expect(result).toEqual({
                data: mockData.rows,
                meta: {
                    total_data: 20,
                    total_pages: 2,
                    current_page: 1,
                    per_page: 10
                }
            });
        });
    });

    describe('getCustomerById', () => {
        it('should return customer data if found', async () => {
            const mockCustomer = { id: 1, name: 'Test User' };
            customerRepo.findById.mockResolvedValue(mockCustomer);

            const result = await service.getCustomerById(1);
            expect(result).toEqual(mockCustomer);
        });

        it('should throw error if customer not found', async () => {
            customerRepo.findById.mockResolvedValue(null);
            await expect(service.getCustomerById(999)).rejects.toThrow('Customer not found');
        });
    });

    describe('removeCustomer', () => {
        it('should return true if deleted successfully', async () => {
            customerRepo.deleteById.mockResolvedValue(true);
            const result = await service.removeCustomer(1);
            expect(result).toBe(true);
        });

        it('should throw error if delete fails', async () => {
            customerRepo.deleteById.mockResolvedValue(false);
            await expect(service.removeCustomer(1)).rejects.toThrow('Customer not found');
        });
    });

    describe('registerCustomer', () => {
        const payload = {
            name: 'New User',
            email: 'test@example.com',
            password: 'password123',
            survey_responses: [],
            addresses: []
        };

        beforeEach(() => {
            customerRepo.getActiveFormFields.mockResolvedValue([]); 
            crypto.randomBytes.mockReturnValue({ toString: () => 'mocktoken' });
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedpass');
        });

        it('should register a new customer successfully', async () => {
            customerRepo.findByEmail.mockResolvedValue(null);
            customerRepo.create.mockResolvedValue({ id: 1, email: payload.email });

            const result = await service.registerCustomer(payload);

            expect(db.transaction).toHaveBeenCalled();
            expect(customerRepo.create).toHaveBeenCalled();
            expect(sendVerificationEmail).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(result).toHaveProperty('id', 1);
        });

        it('should throw error if email already exists', async () => {
            customerRepo.findByEmail.mockResolvedValue({ id: 1 });

            await expect(service.registerCustomer(payload)).rejects.toThrow('Email already registered');
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should validate required survey responses', async () => {
            customerRepo.findByEmail.mockResolvedValue(null);
            customerRepo.getActiveFormFields.mockResolvedValue([
                { id: 10, label: 'Gender', is_required: true }
            ]);

            const invalidPayload = { ...payload, survey_responses: [] }; 

            await expect(service.registerCustomer(invalidPayload)).rejects.toThrow("Field 'Gender' is required");
        });

        it('should save survey and addresses if provided', async () => {
            customerRepo.findByEmail.mockResolvedValue(null);
            customerRepo.create.mockResolvedValue({ id: 123 });

            const complexPayload = {
                ...payload,
                survey_responses: [{ field_id: 1, answer: 'Yes' }],
                addresses: [{ city: 'Jakarta' }]
            };

            await service.registerCustomer(complexPayload);

            expect(CustomerResponse.bulkCreate).toHaveBeenCalled();
            expect(CustomerAddress.bulkCreate).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
        });
    });

    describe('verifyEmailToken', () => {
        it('should verify user if token is valid', async () => {
            const mockUser = { 
                id: 1, 
                is_verified: false, 
                save: jest.fn().mockResolvedValue(true) 
            };
            customerRepo.findByVerificationToken.mockResolvedValue(mockUser);

            const result = await service.verifyEmailToken('validtoken');

            expect(mockUser.is_verified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should throw error if token invalid', async () => {
            customerRepo.findByVerificationToken.mockResolvedValue(null);
            await expect(service.verifyEmailToken('badtoken')).rejects.toThrow('Invalid or expired verification token');
        });
    });

    describe('resendVerification', () => {
        beforeEach(() => {
            crypto.randomBytes.mockReturnValue({ toString: () => 'newtoken' });
        });

        it('should resend verification if user exists and unverified', async () => {
            const mockUser = { 
                id: 1, 
                email: 'test@test.com', 
                is_verified: false, 
                save: jest.fn() 
            };
            customerRepo.findByEmail.mockResolvedValue(mockUser);

            await service.resendVerification('test@test.com');

            expect(mockUser.verification_token).toBe('newtoken');
            expect(mockUser.save).toHaveBeenCalled();
            expect(sendVerificationEmail).toHaveBeenCalled();
        });

        it('should throw error if email not found', async () => {
            customerRepo.findByEmail.mockResolvedValue(null);
            await expect(service.resendVerification('404@test.com')).rejects.toThrow('Email not found');
        });

        it('should throw error if already verified', async () => {
            customerRepo.findByEmail.mockResolvedValue({ is_verified: true });
            await expect(service.resendVerification('verified@test.com')).rejects.toThrow('Account already verified');
        });
    });

    describe('loginCustomer', () => {
        it('should return token on successful login', async () => {
            const mockUser = { 
                id: 1, 
                email: 'test@test.com', 
                password: 'hashed', 
                is_active: true, 
                update: jest.fn() 
            };
            customerRepo.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('jwt-token-123');

            const result = await service.loginCustomer('test@test.com', 'password');

            expect(result).toHaveProperty('token', 'jwt-token-123');
            expect(mockUser.update).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            customerRepo.findByEmail.mockResolvedValue(null);
            await expect(service.loginCustomer('wrong', 'pass')).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if user is inactive', async () => {
            customerRepo.findByEmail.mockResolvedValue({ is_active: false });
            await expect(service.loginCustomer('inactive', 'pass')).rejects.toThrow('Account is inactive');
        });

        it('should throw error if password does not match', async () => {
            customerRepo.findByEmail.mockResolvedValue({ is_active: true, password: 'hashed' });
            bcrypt.compare.mockResolvedValue(false);

            await expect(service.loginCustomer('test', 'wrongpass')).rejects.toThrow('Invalid email or password');
        });
    });
});