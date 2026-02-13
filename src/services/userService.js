import * as userRepo from '../repositories/userRepository.js';
import { buildUserSpecification } from '../specifications/userSpecification.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

export const registerUser = async (payload) => {
  const { username, email, password, role, fullName, phoneNumber, department } = payload;

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) throw new ApiError('Email already registered', 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const profileData = {
    fullName,
    phoneNumber,
    department
  };

  const user = await userRepo.createUserWithProfile(
    { username, email, password: hashedPassword, role },
    profileData
  );

  const userResponse = { ...user };
  delete userResponse.password;

  return userResponse;
};

export const loginUser = async (email, password) => {
  const user = await userRepo.findByEmail(email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError('Invalid email or password', 401);
  }

  if (!user.isActive) throw new ApiError('Account is deactivated', 403);

  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );

  return { 
    token, 
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
};

export const getAllUsers = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  
  const spec = buildUserSpecification(query);
  const skip = (page - 1) * limit;
  
  const users = await userRepo.findAll(spec, { skip, take: limit });
  const total = await userRepo.count(spec);

  return {
    users: users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};