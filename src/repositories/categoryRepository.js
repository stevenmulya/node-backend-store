import Category from '../models/categoryModel.js';

export const findAll = async () => {
    return await Category.findAll({
        order: [['name', 'ASC']]
    });
};

export const findById = async (id) => {
    return await Category.findByPk(id, {
        include: [{ model: Category, as: 'children' }]
    });
};

export const create = async (data) => {
    return await Category.create(data);
};

export const update = async (id, data) => {
    return await Category.update(data, { where: { id } });
};

export const destroy = async (id) => {
    return await Category.destroy({ where: { id } });
};