import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findAll = async (where, orderBy, skip, take) => {
  const [total, data] = await prisma.$transaction([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        itemType: true,
        category: { include: { parent: true } },
        variants: { include: { prices: true } },
        images: true
      }
    })
  ]);
  return { total, data };
};

export const findById = async (id) => {
  return await prisma.item.findUnique({
    where: { id: BigInt(id) },
    include: {
      itemType: true,
      category: true,
      variants: { include: { prices: true } },
      images: true,
      videos: true,
      updateHistories: true
    }
  });
};

export const createItem = async (data) => {
  const { variants, images, ...itemData } = data;
  return await prisma.item.create({
    data: {
      ...itemData,
      variants: {
        create: variants?.map(v => ({
          ...v,
          prices: { create: v.prices || [] }
        }))
      },
      images: {
        create: images?.map(img => ({ url: img.url, isPrimary: img.isPrimary }))
      }
    }
  });
};

export const updateItem = async (id, data) => {
  return await prisma.item.update({
    where: { id: BigInt(id) },
    data
  });
};

export const bulkUnpublish = async (userId) => {
  return await prisma.item.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'ARCHIVED', updatedBy: userId }
  });
};