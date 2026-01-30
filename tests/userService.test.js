import * as userService from '../src/services/userService.js';
import * as userRepo from '../src/repositories/userRepository.js';
import generateToken from '../src/utils/generateToken.js';

jest.mock('../src/repositories/userRepository.js');
jest.mock('../src/utils/generateToken.js');

describe('User Service Logic', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loginUser', () => {
        
        test('Should login successfully with correct credentials', async () => {
            const mockUser = {
                id: 1,
                name: 'Steven',
                email: 'steven@gmail.com',
                level: 'admin',
                matchPassword: jest.fn().mockResolvedValue(true)
            };

            userRepo.findByEmail.mockResolvedValue(mockUser);
            generateToken.mockReturnValue('token-palsu-123');

            const result = await userService.loginUser('steven@gmail.com', 'rahasia');

            expect(result.token).toBe('token-palsu-123');
            expect(result.email).toBe('steven@gmail.com');
            expect(mockUser.matchPassword).toHaveBeenCalledWith('rahasia');
        });

        test('Should throw 401 if password incorrect', async () => {
            const mockUser = {
                id: 1,
                email: 'steven@gmail.com',
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            userRepo.findByEmail.mockResolvedValue(mockUser);

            await expect(userService.loginUser('steven@gmail.com', 'salah'))
                .rejects.toThrow('Invalid email or password');
        });

        test('Should throw 401 if email not found', async () => {
            userRepo.findByEmail.mockResolvedValue(null);

            await expect(userService.loginUser('hantu@gmail.com', 'bebas'))
                .rejects.toThrow('Invalid email or password');
        });
    });

    describe('registerUser', () => {

        test('Should successfully register new user', async () => {
            userRepo.findByEmail.mockResolvedValue(null);
            
            userRepo.create.mockResolvedValue({
                id: 2,
                name: 'New User',
                email: 'new@gmail.com',
                level: 'customer'
            });

            generateToken.mockReturnValue('token-baru');

            const payload = { name: 'New User', email: 'new@gmail.com', password: '123' };
            const result = await userService.registerUser(payload);

            expect(result.id).toBe(2);
            expect(userRepo.create).toHaveBeenCalledWith(payload);
        });

        test('Should throw 400 if user already exists', async () => {
            userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'ada@gmail.com' });

            const payload = { name: 'New User', email: 'ada@gmail.com', password: '123' };

            await expect(userService.registerUser(payload))
                .rejects.toThrow('User already exists');
            
            expect(userRepo.create).not.toHaveBeenCalled();
        });
    });
});