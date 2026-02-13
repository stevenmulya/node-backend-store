import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      adminProfile: true,
      customerProfile: true
    }
  });
};

export const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      adminProfile: true,
      customerProfile: true
    }
  });
};

export const findAuthUser = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      adminProfile: true,
      customerProfile: true
    }
  });
};

export const findAll = async (specification, options = {}) => {
  const { skip = 0, take = 10 } = options;
  return await prisma.user.findMany({
    where: specification,
    skip: Number(skip),
    take: Number(take),
    include: {
      adminProfile: true,
      customerProfile: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const count = async (specification) => {
  return await prisma.user.count({ where: specification });
};

export const createUserWithProfile = async (userData, profileData) => {
  return await prisma.$transaction(async (tx) => {
    return await tx.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        ...(userData.role === 'CUSTOMER'
          ? { customerProfile: { create: profileData } }
          : { adminProfile: { create: profileData } }
        )
      },
      include: {
        adminProfile: true,
        customerProfile: true
      }
    });
  });
};