import * as orderService from '../services/orderService.js';
import * as orderRepo from '../repositories/orderRepository.js';

export const getOrdersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'newest';

        const { count, rows } = await orderRepo.findAllOrders({
            page, limit, search, sort
        });

        return res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: rows,
            meta: {
                total_data: count,
                total_pages: Math.ceil(count / limit),
                current_page: page,
                per_page: limit
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderRepo.findOrderById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { customer_id, address_id, items } = req.body;

        if (!customer_id || !address_id || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customer_id, address_id, or items'
            });
        }

        const newOrder = await orderService.processOrderCreation(req.body);

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};