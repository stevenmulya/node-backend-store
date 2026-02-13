export const buildItemSpecification = (query) => {
  const { search, category_id, status, low_stock } = query;
  let where = { isDeleted: false };

  if (category_id) {
    where.itemCategoryId = Array.isArray(category_id) 
      ? { in: category_id.map(Number) } 
      : Number(category_id);
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } }
    ];
  }

  if (low_stock === 'true') {
    where.variants = {
      some: { quantity: { lt: 5 } }
    };
  }

  if (status) where.status = status;

  return where;
};

export const getOrderBy = (sort) => {
  const sortMap = {
    'newest': { createdAt: 'desc' },
    'oldest': { createdAt: 'asc' },
    'price_asc': { variants: { _min: { price: 'asc' } } },
    'price_desc': { variants: { _max: { price: 'desc' } } }
  };
  return sortMap[sort] || sortMap['newest'];
};