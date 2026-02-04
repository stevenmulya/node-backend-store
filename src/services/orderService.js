import db from '../config/database.js';
import * as cartRepo from '../repositories/cartRepository.js';
import * as orderRepo from '../repositories/orderRepository.js';
import * as customerRepo from '../repositories/customerRepository.js';
import ApiError from '../utils/ApiError.js';

export const checkout = async (customerId, addressId, paymentMethod) => {
    const transaction = await db.transaction();

    try {
        const cart = await cartRepo.findCartByCustomer(customerId);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new ApiError('Cart is empty', 400);
        }

        const address = await customerRepo.findById(addressId); // Pastikan ada method ini di customerRepo
        if (!address) {
            throw new ApiError('Address not found', 404);
        }

        let totalItemsPrice = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            const product = item.product;
            
            if (product.stock < item.quantity) {
                throw new ApiError(`Stock for ${product.name} is not enough`, 400);
            }

            const linePrice = product.price * item.quantity;
            totalItemsPrice += linePrice;

            orderItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                snap_product_name: product.name,
                snap_product_sku: product.sku,
                snap_product_price: product.price,
                total_line_price: linePrice
            });
        }

        const shippingCost = 15000; 
        const totalAmount = totalItemsPrice + shippingCost;
        const invoiceNumber = `INV/${new Date().getTime()}/${customerId.substring(0,4).toUpperCase()}`;

        const newOrder = await orderRepo.createOrder({
            customer_id: customerId,
            invoice_number: invoiceNumber,
            order_status: 'pending',
            payment_status: 'unpaid',
            total_items_price: totalItemsPrice,
            shipping_cost: shippingCost,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            snap_recipient_name: address.recipient_name,
            snap_phone: address.phone,
            snap_full_address: address.full_address,
            snap_city: address.city,
            snap_postal_code: address.postal_code,
            snap_province: address.state,
            snap_country: address.country,
            note: 'Order from web'
        }, transaction);

        const itemsWithOrderId = orderItemsData.map(item => ({
            ...item,
            order_id: newOrder.id
        }));
        
        await orderRepo.createOrderItems(itemsWithOrderId, transaction);
        await cartRepo.clearCart(cart.id, transaction);
        await transaction.commit();

        return newOrder;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};