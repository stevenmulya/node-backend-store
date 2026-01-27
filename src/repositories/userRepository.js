import User from '../models/userModel.js';

export const findByEmail = async (email, includePassword = false) => {
    if (includePassword) {
        return await User.scope('withPassword').findOne({ where: { email } });
    }
    return await User.findOne({ where: { email } });
};

export const findById = async (id) => {
    return await User.findByPk(id);
};

export const create = async (userData) => {
    return await User.create(userData);
};