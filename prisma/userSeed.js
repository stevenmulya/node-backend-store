import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  const password = await bcrypt.hash('password123', 10);

  // 1. SEED ADMINS (5 User)
  const admins = [
    { username: 'steven_owner', email: 'owner@store.com', role: 'OWNER', fullName: 'Steven Owner', dept: 'Management', level: 3, empId: 'EMP-001' },
    { username: 'budi_manager', email: 'budi@store.com', role: 'MANAGER', fullName: 'Budi Hartono', dept: 'Operations', level: 2, empId: 'EMP-002' },
    { username: 'siti_staff', email: 'siti@store.com', role: 'STAFF', fullName: 'Siti Aminah', dept: 'Sales', level: 1, empId: 'EMP-003' },
    { username: 'agus_staff', email: 'agus@store.com', role: 'STAFF', fullName: 'Agus Setiawan', dept: 'Warehouse', level: 1, empId: 'EMP-004' },
    { username: 'rindu_staff', email: 'rindu@store.com', role: 'STAFF', fullName: 'Rindu Cahya', dept: 'Admin', level: 1, empId: 'EMP-005' },
  ];

  for (const adm of admins) {
    await prisma.user.create({
      data: {
        username: adm.username,
        email: adm.email,
        password: password,
        role: adm.role,
        adminProfile: {
          create: {
            fullName: adm.fullName,
            employeeId: adm.empId,
            department: adm.dept,
            phoneNumber: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
            accessLevel: adm.level,
          }
        }
      }
    });
  }

  // 2. SEED CUSTOMERS (5 User)
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        username: `customer_user_${i}`,
        email: `customer${i}@gmail.com`,
        password: password,
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            fullName: `Customer Pelanggan ${i}`,
            phoneNumber: `0899${Math.floor(10000000 + Math.random() * 90000000)}`,
            birthDate: new Date(1990 + i, i, i),
            loyaltyPoint: i * 150,
            referralCode: `REF-CUST-00${i}`,
            isVerified: i % 2 === 0,
            verifiedAt: i % 2 === 0 ? new Date() : null,
          }
        }
      }
    });
  }
}