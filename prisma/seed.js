import { PrismaClient } from '@prisma/client';
import { seedUsers } from './userSeed.js';
import { seedItems } from './itemSeed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.user.deleteMany();
  await prisma.item.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.itemCategory.deleteMany();

  console.log('Seeding Users...');
  await seedUsers();

  console.log('Seeding Items...');
  await seedItems();

  console.log('✅ All seeding operations completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });