import db from '../config/database.js';
import * as orderRepo from '../repositories/orderRepository.js';
import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';
import CustomerAddress from '../models/customerAddressModel.js';

export const getOrdersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'newest';

        const { count, rows } = await orderRepo.findAllOrders({
            page,
            limit,
            search,
            sort
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
        console.error(error);
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
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
};

export const createOrder = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { customer_id, address_id, payment_method, shipping_cost, items } = req.body;

        if (!customer_id || !address_id || !items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const address = await CustomerAddress.findOne({
            where: { id: address_id, customer_id }
        });

        if (!address) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        let totalItemsPrice = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found` });
            }

            let finalPrice = 0;
            let finalName = product.name;
            let finalSku = product.sku;
            let checkStock = 0;

            if (product.product_type === 'variable') {
                if (!item.variant_id) {
                    await transaction.rollback();
                    return res.status(400).json({ success: false, message: `Product ${product.name} is variable, please select a variant` });
                }

                const variant = await ProductVariant.findOne({
                    where: { id: item.variant_id, product_id: product.id }
                });

                if (!variant) {
                    await transaction.rollback();
                    return res.status(404).json({ success: false, message: `Variant ID ${item.variant_id} not found` });
                }

                finalPrice = parseFloat(variant.price);
                checkStock = variant.stock;
                finalName = `${product.name} - ${variant.name}`; 
                finalSku = variant.sku || product.sku;

            } else {
                finalPrice = parseFloat(product.price);
                checkStock = product.stock;
            }

            if (checkStock < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: `Stock not enough for ${finalName}` });
            }

            const linePrice = finalPrice * item.quantity;
            totalItemsPrice += linePrice;

            orderItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                snap_product_name: finalName,
                snap_product_sku: finalSku,
                snap_product_price: finalPrice,
                total_line_price: linePrice
            });
        }

        const totalAmount = totalItemsPrice + parseFloat(shipping_cost || 0);
        const invoiceNumber = `INV/${new Date().getTime()}/${customer_id.substring(0, 4).toUpperCase()}`;

        const newOrder = await orderRepo.createOrder({
            customer_id,
            invoice_number: invoiceNumber,
            order_status: 'pending',
            payment_status: 'unpaid',
            total_items_price: totalItemsPrice,
            shipping_cost: shipping_cost || 0,
            total_amount: totalAmount,
            payment_method,
            snap_recipient_name: address.recipient_name,
            snap_phone: address.phone,
            snap_full_address: address.full_address,
            snap_city: address.city,
            snap_postal_code: address.postal_code,
            snap_province: address.state,
            snap_country: address.country,
            note: 'Manual order by Admin'
        }, transaction);

        const itemsWithOrderId = orderItemsData.map(item => ({
            ...item,
            order_id: newOrder.id
        }));
        
        await orderRepo.createOrderItems(itemsWithOrderId, transaction);

        await transaction.commit();

        return res.status(201).json({ 
            success: true, 
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};