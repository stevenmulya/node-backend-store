import { z } from 'zod';

const jsonString = z.string().transform((str, ctx) => {
    if (!str || str === 'undefined' || str === 'null') return undefined;
    try {
        return JSON.parse(str);
    } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON format" });
        return z.NEVER;
    }
});

const stringToBoolean = z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
}, z.boolean().optional());

const stringToNumber = z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}, z.number().min(0).optional());

const productFields = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    sku: z.string().optional().or(z.literal('')),
    product_type: z.enum(['simple', 'variable']).default('simple'),
    
    price: stringToNumber.default(0), 
    stock: stringToNumber.pipe(z.number().int().min(0).optional()).default(0),
    
    weight: stringToNumber.default(0),
    length: stringToNumber.default(0),
    width:  stringToNumber.default(0),
    height: stringToNumber.default(0),
    
    description: z.string().optional(),
    brand: z.string().optional(),
    similarities: z.string().optional(),
    
    category_id: stringToNumber.optional(),
    
    is_published: stringToBoolean.default(false),
    is_best_seller: stringToBoolean.default(false),
    is_pinned: stringToBoolean.default(false),
    
    attributes: jsonString.optional(),
    videos: jsonString.optional(),
    variants: jsonString.optional(),
});

export const createProductSchema = z.object({
    body: productFields
});

export const updateProductSchema = z.object({
    body: productFields.partial()
});