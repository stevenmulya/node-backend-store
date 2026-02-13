import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedItems() {
  const typeElectronics = await prisma.itemType.create({
    data: {
      name: 'Electronics',
      description: 'Gadgets, cameras, and more'
    }
  });

  const catSmartphone = await prisma.itemCategory.create({
    data: {
      name: 'Smartphone',
      attributeTemplates: {
        create: [
          { name: 'RAM', type: 'NUMBER' },
          { name: 'Color', type: 'COLOR' }
        ]
      }
    }
  });

  const products = [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro' },
    { name: 'Samsung Galaxy S24', slug: 'samsung-s24' },
    { name: 'Google Pixel 8', slug: 'google-pixel-8' },
    { name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra' },
    { name: 'Oppo Find X7', slug: 'oppo-find-x7' }
  ];

  for (const prod of products) {
    await prisma.item.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        itemTypeId: typeElectronics.id,
        itemCategoryId: catSmartphone.id,
        status: 'ACTIVE',
        description: `High-end flagship ${prod.name}`,
        shortDescription: `Best of ${prod.name}`,
        isPinned: true,
        attributes: { ram: '12GB', storage: '256GB' },
        variants: {
          create: [
            {
              code: `${prod.slug}-black`,
              price: 15000000,
              quantity: 50
            }
          ]
        }
      }
    });
  }
}