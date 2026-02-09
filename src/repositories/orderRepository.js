import { Op } from 'sequelize';
import Order from '../models/order/orderModel.js';
import OrderItem from '../models/order/orderItemModel.js';
import Customer from '../models/customer/customerModel.js';

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

    if (sort === 'oldest') orderOptions = [['created_at', 'ASC']];

    const whereCondition = {};
    
    if (search) {
        whereCondition[Op.or] = [
            { invoice_number: { [Op.like]: `%${search}%` } },
            { '$customer.name$': { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Order.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'name', 'email']
            }
        ],
        limit,
        offset,
        order: orderOptions,
        distinct: true
    });

    return { count, rows };
};