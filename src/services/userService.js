import * as userRepo from '../repositories/userRepository.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

export const loginUser = async (email, password) => {
    const user = await userRepo.findByEmail(email, true);
    
    if (user && (await user.matchPassword(password))) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            level: user.level,
            token: generateToken(user.id, user.level)
        };
    }
    
    throw new ApiError('Invalid email or password', 401);
};

export const registerUser = async (userData) => {
    const userExists = await userRepo.findByEmail(userData.email);
    if (userExists) throw new ApiError('User already exists', 400);

    const user = await userRepo.create(userData);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        token: generateToken(user.id, user.level)
    };
};