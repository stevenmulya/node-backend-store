import { Op } from 'sequelize';
import Customer from '../models/customerModel.js';
import CustomerAddress from '../models/customerAddressModel.js';
import CustomerFormField from '../models/customerFormFieldModel.js';
import CustomerResponse from '../models/customerResponseModel.js';

export const create = async (data, options) => {
    return await Customer.create(data, options);
};

export const findByEmail = async (email) => {
    return await Customer.findOne({ where: { email } });
};

export const findByVerificationToken = async (token) => {
    return await Customer.findOne({
        where: {
            verification_token: token,
            verification_token_expires: { [Op.gt]: new Date() }
        }
    });
};

export const findById = async (id) => {
    return await Customer.findByPk(id, {
        include: [
            { 
                model: CustomerAddress, 
                as: 'addresses' 
            },
            { 
                model: CustomerResponse, 
                as: 'responses',
                include: [
                    { 
                        model: CustomerFormField, 
                        as: 'field',
                        attributes: ['label'] 
                    }
                ]
            }
        ],
        attributes: { exclude: ['password', 'verification_token'] }
    });
};

export const findAll = async ({ page, limit, search, sort }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
        ];
    }

    const orderDirection = sort === 'oldest' ? 'ASC' : 'DESC';

    return await Customer.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', orderDirection]],
        include: [
            { model: CustomerAddress, as: 'addresses' }
        ],
        distinct: true
    });
};

export const deleteById = async (id) => {
    return await Customer.destroy({ where: { id } });
};

export const getActiveFormFields = async () => {
    return await CustomerFormField.findAll({
        where: { is_active: true },
        order: [['createdAt', 'ASC']]
    });
};