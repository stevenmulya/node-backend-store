import { jest } from '@jest/globals';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn()
    })
}));

import nodemailer from 'nodemailer';
import * as emailSender from '../src/utils/emailSender.js';

describe('Email Sender Utility Tests', () => {
    const originalEnv = process.env;
    let mockSendMail;

    beforeEach(() => {
        const transporter = nodemailer.createTransport();
        mockSendMail = transporter.sendMail;
        
        mockSendMail.mockReset();
        mockSendMail.mockResolvedValue(true);

        jest.spyOn(console, 'log').mockImplementation(() => {}); 
        jest.spyOn(console, 'error').mockImplementation(() => {});

        process.env = { ...originalEnv };
        process.env.SMTP_HOST = 'smtp.test.com';
        process.env.SMTP_PORT = '587';
        process.env.SMTP_USER = 'admin@test.com';
        process.env.SMTP_PASS = 'password';
        process.env.FRONTEND_URL = 'http://test-frontend.com';
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should create mail options and call sendMail successfully', async () => {
        const toEmail = 'user@example.com';
        const name = 'John Doe';
        const token = '12345token';

        await emailSender.sendVerificationEmail(toEmail, name, token);

        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            from: expect.stringContaining('admin@test.com'),
            to: toEmail,
            subject: 'Verify Your Account',
            html: expect.stringContaining(name)
        }));
    });

    it('should return early and not send email if SMTP credentials are missing', async () => {
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;

        await emailSender.sendVerificationEmail('test@test.com', 'Test', 'token');

        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should catch and log error if sendMail fails', async () => {
        const errorMsg = 'Connection timeout';
        mockSendMail.mockRejectedValue(new Error(errorMsg));

        await emailSender.sendVerificationEmail('test@test.com', 'Test', 'token');

        expect(mockSendMail).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Email sending failed'),
            errorMsg
        );
    });

    it('should use default localhost URL if FRONTEND_URL is not defined', async () => {
        delete process.env.FRONTEND_URL;

        await emailSender.sendVerificationEmail('test@test.com', 'Test', 'token');

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            html: expect.stringContaining('http://localhost:3000/verify-email?token=token')
        }));
    });
});