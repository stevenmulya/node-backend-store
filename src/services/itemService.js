import * as itemRepo from '../repositories/itemRepository.js';
import { buildItemSpecification, getOrderBy } from '../specifications/itemSpecification.js';
import ApiError from '../utils/ApiError.js';

const serialize = (data) => JSON.parse(JSON.stringify(data, (k, v) => typeof v === 'bigint' ? v.toString() : v));

export const getInventory = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const where = buildItemSpecification(query);
  const orderBy = getOrderBy(query.sort);

  const { total, data } = await itemRepo.findAll(where, orderBy, (page - 1) * limit, limit);

  return serialize({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
};

export const storeItem = async (payload, userId) => {
  try {
    const data = { ...payload, createdBy: userId };
    const result = await itemRepo.createItem(data);
    return serialize(result);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      payload.slug = `${payload.slug}-${Math.floor(Math.random() * 1000)}`;
      return storeItem(payload, userId);
    }
    throw error;
  }
};

export const getItemDetails = async (id) => {
  const item = await itemRepo.findById(id);
  if (!item) throw new ApiError('Item not found', 404);
  return serialize(item);
};

export const massUnpublish = async (userId) => {
  return await itemRepo.bulkUnpublish(userId);
};