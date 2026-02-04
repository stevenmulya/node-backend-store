import { Op } from 'sequelize';
import Order from '../models/orderModel.js';
import OrderItem from '../models/orderItemModel.js';
import Customer from '../models/customerModel.js';

export const createOrder = async (orderData, transaction) => {
    return await Order.create(orderData, { transaction });
};

export const createOrderItems = async (itemsData, transaction) => {
    return await OrderItem.bulkCreate(itemsData, { transaction });
};

export const findOrdersByCustomer = async (customerId) => {
    return await Order.findAll({
        where: { customer_id: customerId },
        include: [{ model: OrderItem, as: 'items' }],
        order: [['created_at', 'DESC']]
    });
};

export const findOrderById = async (orderId) => {
    return await Order.findByPk(orderId, {
        include: [
            { 
                model: OrderItem, 
                as: 'items'
            },
            {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'name', 'email', 'phone']
            }
        ]
    });
};

export const findAllOrders = async ({ page, limit, search, sort }) => {
    const offset = (page - 1) * limit;
    let orderOptions = [['created_at', 'DESC']];

    const whereCondition = {};
    const includeCondition = [
        { 
            model: Customer, 
            as: 'customer',
            attributes: ['id', 'name', 'email'] 
        }
    ];

    if (search) {
        whereCondition[Op.or] = [
            { invoice_number: { [Op.like]: `%${search}%` } },
            { '$customer.name$': { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Order.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        limit,
        offset,
        order: orderOptions,
        distinct: true
    });

    return {
        count,
        rows
    };
};