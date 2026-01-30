import { storeProduct } from '../src/services/productService.js';
import * as productRepo from '../src/repositories/productRepository.js';
import db from '../src/config/database.js';

jest.mock('../src/config/database.js', () => {
    return {
        define: jest.fn().mockReturnValue({
            belongsTo: jest.fn(),
            hasMany: jest.fn(),
            beforeSave: jest.fn(),
            prototype: {},
            addHook: jest.fn()
        }),
        transaction: jest.fn().mockImplementation(() => ({
            commit: jest.fn(),
            rollback: jest.fn(),
        })),
    };
});

jest.mock('../src/repositories/productRepository.js');
jest.mock('../src/services/attributeService.js');
jest.mock('../src/services/historyService.js');
jest.mock('../src/models/productVideoModel.js');
jest.mock('../src/models/productVariantModel.js');

describe('Product Service - Store Product', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should successfully create product in one attempt', async () => {
        productRepo.create.mockResolvedValue({ id: 1, name: 'Baju' });
        productRepo.findById.mockResolvedValue({ id: 1, name: 'Baju' });

        const payload = { name: 'Baju', slug: 'baju', userId: 1 };
        
        const result = await storeProduct(payload, []);

        expect(result.id).toBe(1);
        expect(productRepo.create).toHaveBeenCalledTimes(1);
        expect(db.transaction).toHaveBeenCalled();
    });

    test('Should retry logic when Slug collision occurs', async () => {
        const errorSlug = new Error('Validation error');
        errorSlug.name = 'SequelizeUniqueConstraintError';
        errorSlug.fields = { slug: true };

        productRepo.create
            .mockRejectedValueOnce(errorSlug)
            .mockResolvedValueOnce({ id: 2, name: 'Baju Unik' });

        productRepo.findById.mockResolvedValue({ id: 2, name: 'Baju Unik' });

        const payload = { name: 'Baju', slug: 'baju', userId: 1 };

        await storeProduct(payload, []);

        expect(productRepo.create).toHaveBeenCalledTimes(2);
        
        const secondCallArgs = productRepo.create.mock.calls[1][0];
        expect(secondCallArgs.slug).not.toBe('baju');
        expect(secondCallArgs.slug).toContain('baju-');
    });

    test('Should throw error immediately if SKU duplicate', async () => {
        const errorSku = new Error('Validation error');
        errorSku.name = 'SequelizeUniqueConstraintError';
        errorSku.fields = { sku: true };

        productRepo.create.mockRejectedValue(errorSku);

        const payload = { name: 'Baju', sku: 'SKU-123', userId: 1 };

        await expect(storeProduct(payload, [])).rejects.toThrow(/SKU 'SKU-123' already exists/);
        expect(productRepo.create).toHaveBeenCalledTimes(1);
    });
});