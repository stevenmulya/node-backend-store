import Product from '../models/productModel.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        sendResponse(res, 200, 'Products retrieved successfully', products);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, price, description } = req.body;
        
        if (!req.file) {
            throw new ApiError('Image upload is required', 400);
        }

        const image = `/uploads/${req.file.filename}`;
        
        const productId = await Product.create({ 
            name, 
            price, 
            description, 
            image,
            createdBy: req.user.id 
        });
        
        const newProduct = await Product.findById(productId);
        
        sendResponse(res, 201, 'Product created successfully', newProduct);
    } catch (error) {
        next(error);
    }
};

export { getProducts, createProduct };