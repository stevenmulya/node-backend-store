// import { Op } from 'sequelize';
// import User from '../models/user/userModel.js';
// import Category from '../models/product/categoryModel.js';
// import ProductImage from '../models/product/productImageModel.js';
// import ProductAttribute from '../models/product/productAttributeModel.js';
// import AttributeTemplate from '../models/product/attributeTemplateModel.js';
// import ProductVariant from '../models/product/productVariantModel.js';
// import ProductVideo from '../models/product/productVideoModel.js';

// export const buildInventoryQuery = (filters) => {
//     const { 
//         category_id, 
//         search, 
//         sort, 
//         low_stock, 
//         page, 
//         limit, 
//         mode,
//         include_variants,
//         ...dynamicAttributes 
//     } = filters;
    
//     let where = {};
    
//     if (category_id && category_id !== 'all') {
//         if (Array.isArray(category_id)) {
//             where.category_id = { [Op.in]: category_id };
//         } else {
//             where.category_id = category_id;
//         }
//     }

//     if (search) {
//         where[Op.or] = [
//             { name: { [Op.like]: `%${search}%` } },
//             { brand: { [Op.like]: `%${search}%` } },
//             { sku: { [Op.like]: `%${search}%` } }
//         ];
//     }

//     if (low_stock === 'true') {
//         where.stock = { [Op.lt]: 5 };
//     }

//     let include = [
//         { 
//             model: User, 
//             as: 'creator', 
//             attributes: ['name'] 
//         },
//         { 
//             model: Category, 
//             as: 'category', 
//             include: [{ model: Category, as: 'parent', attributes: ['name'] }] 
//         }
//     ];

//     if (mode !== 'simple') {
//         include.push(
//             { 
//                 model: ProductImage, 
//                 as: 'images', 
//                 attributes: ['url', 'is_primary'] 
//             },
//             { 
//                 model: ProductVariant, 
//                 as: 'variants', 
//                 attributes: ['id', 'price', 'stock', 'sku'] 
//             },
//             {
//                 model: ProductVideo,
//                 as: 'videos',
//                 attributes: ['video_url', 'provider', 'title']
//             }
//         );
//     }

//     Object.entries(dynamicAttributes).forEach(([key, val]) => {
//         if (val && val !== '') {
//             include.push({
//                 model: ProductAttribute,
//                 as: 'attributeValues',
//                 where: { value: val },
//                 include: [{ 
//                     model: AttributeTemplate, 
//                     as: 'template', 
//                     where: { name: key },
//                     attributes: [] 
//                 }]
//             });
//         }
//     });

//     const sortMap = {
//         'newest': [['createdAt', 'DESC'], ['id', 'DESC']],
//         'oldest': [['createdAt', 'ASC'], ['id', 'ASC']],
//         'price_asc': [['price', 'ASC'], ['id', 'ASC']],
//         'price_desc': [['price', 'DESC'], ['id', 'DESC']]
//     };

//     const order = sortMap[sort] || sortMap['newest'];

//     return { 
//         where, 
//         include, 
//         order,
//         distinct: true 
//     };
// };