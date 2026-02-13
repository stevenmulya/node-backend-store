// import db from '../config/database.js';
// import Product from '../models/product/productModel.js';
// import ProductVariant from '../models/product/productVariantModel.js';
// import CustomerAddress from '../models/customer/customerAddressModel.js';
// import * as orderRepo from '../repositories/orderRepository.js';
// import ApiError from '../utils/ApiError.js';

// export const processOrderCreation = async (payload) => {
//     const { customer_id, address_id, payment_method, shipping_cost, items, note } = payload;
//     const transaction = await db.transaction();

//     try {
//         const address = await CustomerAddress.findOne({
//             where: { id: address_id, customer_id },
//             transaction
//         });

//         if (!address) {
//             throw new ApiError('Address not found', 404);
//         }

//         let totalItemsPrice = 0;
//         const orderItemsData = [];
//         const sortedItems = items.sort((a, b) => a.product_id - b.product_id);

//         for (const item of sortedItems) {
//             const product = await Product.findByPk(item.product_id, {
//                 transaction,
//                 lock: transaction.LOCK.UPDATE
//             });

//             if (!product) {
//                 throw new ApiError(`Product ID ${item.product_id} not found`, 404);
//             }

//             let finalPrice = Number(product.price);
//             let finalName = product.name;
//             let finalSku = product.sku;
//             let currentStock = product.stock;
//             let variantId = null;

//             if (product.product_type === 'variable') {
//                 if (!item.variant_id) {
//                     throw new ApiError(`Product ${product.name} requires a variant`, 400);
//                 }

//                 const variant = await ProductVariant.findByPk(item.variant_id, {
//                     transaction,
//                     lock: transaction.LOCK.UPDATE
//                 });

//                 if (!variant) {
//                     throw new ApiError(`Variant ID ${item.variant_id} not found`, 404);
//                 }

//                 finalPrice = Number(variant.price);
//                 finalName = `${product.name} - ${variant.name}`;
//                 finalSku = variant.sku || product.sku;
//                 currentStock = variant.stock;
//                 variantId = variant.id;

//                 if (currentStock < item.quantity) {
//                     throw new ApiError(`Insufficient stock for ${finalName}`, 400);
//                 }

//                 await variant.decrement('stock', { by: item.quantity, transaction });
//             } else {
//                 if (currentStock < item.quantity) {
//                     throw new ApiError(`Insufficient stock for ${finalName}`, 400);
//                 }

//                 await product.decrement('stock', { by: item.quantity, transaction });
//             }

//             const linePrice = finalPrice * item.quantity;
//             totalItemsPrice += linePrice;

//             orderItemsData.push({
//                 product_id: product.id,
//                 variant_id: variantId,
//                 quantity: item.quantity,
//                 snap_product_name: finalName,
//                 snap_product_sku: finalSku,
//                 snap_product_price: finalPrice,
//                 total_line_price: linePrice
//             });
//         }

//         const finalShippingCost = Number(shipping_cost || 0);
//         const totalAmount = totalItemsPrice + finalShippingCost;
//         const invoiceNumber = `INV/${Date.now()}/${customer_id.substring(0, 4).toUpperCase()}`;

//         const newOrder = await orderRepo.createOrder({
//             customer_id,
//             invoice_number: invoiceNumber,
//             order_status: 'pending',
//             payment_status: 'unpaid',
//             total_items_price: totalItemsPrice,
//             shipping_cost: finalShippingCost,
//             total_amount: totalAmount,
//             payment_method,
//             snap_recipient_name: address.recipient_name,
//             snap_phone: address.phone,
//             snap_full_address: address.full_address,
//             snap_city: address.city,
//             snap_postal_code: address.postal_code,
//             snap_province: address.state,
//             snap_country: address.country || 'Indonesia',
//             note: note || ''
//         }, transaction);

//         const itemsWithOrderId = orderItemsData.map(item => ({
//             ...item,
//             order_id: newOrder.id
//         }));

//         await orderRepo.createOrderItems(itemsWithOrderId, transaction);

//         await transaction.commit();
//         return newOrder;

//     } catch (error) {
//         await transaction.rollback();
//         throw error;
//     }
// };