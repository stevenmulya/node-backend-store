import Category from '../models/categoryModel.js';

export const findAll = async () => {
    return await Category.findAll({ order: [['name', 'ASC']] });
};

export const findById = async (id) => {
    return await Category.findByPk(id, {
        include: [{ model: Category, as: 'children' }, { model: Category, as: 'parent' }]
    });
};

export const getAncestors = async (categoryId) => {
    const ids = [];
    let currentId = categoryId;
    while (currentId) {
        const cat = await Category.findByPk(currentId, { attributes: ['id', 'parent_id'] });
        if (!cat) break;
        ids.push(cat.id);
        currentId = cat.parent_id; 
    }
    return ids;
};

export const create = async (data) => Category.create(data);
export const update = async (id, data) => Category.update(data, { where: { id } });
export const destroy = async (id) => Category.destroy({ where: { id } });