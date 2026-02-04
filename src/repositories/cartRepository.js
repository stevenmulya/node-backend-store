import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';
import Product from '../models/productModel.js';
import ProductImage from '../models/productImageModel.js';

export const findCartByCustomer = async (customerId) => {
    return await Cart.findOne({
        where: { customer_id: customerId },
        include: [
            {
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{ model: ProductImage, as: 'images', limit: 1 }] 
                }]
            }
        ]
    });
};

export const createCart = async (customerId) => {
    return await Cart.create({ customer_id: customerId });
};

export const addItemToCart = async (cartId, productId, quantity, note) => {
    const existingItem = await CartItem.findOne({
        where: { cart_id: cartId, product_id: productId }
    });

    if (existingItem) {
        existingItem.quantity += quantity;
        return await existingItem.save();
    } else {
        return await CartItem.create({
            cart_id: cartId,
            product_id: productId,
            quantity,
            note
        });
    }
};

export const removeItem = async (cartId, productId) => {
    return await CartItem.destroy({
        where: { cart_id: cartId, product_id: productId }
    });
};

export const clearCart = async (cartId, transaction) => {
    return await CartItem.destroy({
        where: { cart_id: cartId },
        transaction
    });
};