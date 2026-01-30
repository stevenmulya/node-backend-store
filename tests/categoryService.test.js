import * as categoryService from '../src/services/categoryService.js';
import * as categoryRepo from '../src/repositories/categoryRepository.js';

jest.mock('../src/repositories/categoryRepository.js');

describe('Category Service Logic', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCategoryTree', () => {
        test('Should correctly build a nested tree structure', async () => {
            const mockCategories = [
                { id: 1, name: 'Electronics', parent_id: null, toJSON: () => ({ id: 1, name: 'Electronics', parent_id: null }) },
                { id: 2, name: 'Laptops', parent_id: 1, toJSON: () => ({ id: 2, name: 'Laptops', parent_id: 1 }) },
                { id: 3, name: 'Clothing', parent_id: null, toJSON: () => ({ id: 3, name: 'Clothing', parent_id: null }) }
            ];

            categoryRepo.findAll.mockResolvedValue(mockCategories);

            const result = await categoryService.getCategoryTree();

            expect(result).toHaveLength(2); 
            
            const electronics = result.find(c => c.id === 1);
            expect(electronics).toBeDefined();
            expect(electronics.children).toHaveLength(1);
            expect(electronics.children[0].name).toBe('Laptops');

            const clothing = result.find(c => c.id === 3);
            expect(clothing).toBeDefined();
            expect(clothing.children).toHaveLength(0);
        });

        test('Should return empty array if no categories found', async () => {
            categoryRepo.findAll.mockResolvedValue([]);
            const result = await categoryService.getCategoryTree();
            expect(result).toEqual([]);
        });
    });

    describe('storeCategory', () => {
        test('Should create root category successfully', async () => {
            const payload = { name: 'New Category' };
            categoryRepo.create.mockResolvedValue({ id: 1, ...payload });

            const result = await categoryService.storeCategory(payload);

            expect(result.id).toBe(1);
            expect(categoryRepo.create).toHaveBeenCalledWith(payload);
            expect(categoryRepo.findById).not.toHaveBeenCalled();
        });

        test('Should create sub-category if parent exists', async () => {
            const payload = { name: 'Sub Category', parent_id: 10 };
            
            categoryRepo.findById.mockResolvedValue({ id: 10, name: 'Parent' });
            categoryRepo.create.mockResolvedValue({ id: 2, ...payload });

            const result = await categoryService.storeCategory(payload);

            expect(result.id).toBe(2);
            expect(categoryRepo.findById).toHaveBeenCalledWith(10);
            expect(categoryRepo.create).toHaveBeenCalledWith(payload);
        });

        test('Should throw 404 if parent category does not exist', async () => {
            const payload = { name: 'Sub Category', parent_id: 999 };
            
            categoryRepo.findById.mockResolvedValue(null);

            await expect(categoryService.storeCategory(payload))
                .rejects.toThrow('Parent category not found');
            
            expect(categoryRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('removeCategory', () => {
        test('Should successfully remove category with no children', async () => {
            const mockCategory = { 
                id: 1, 
                children: [] 
            };
            
            categoryRepo.findById.mockResolvedValue(mockCategory);
            categoryRepo.destroy.mockResolvedValue(true);

            const result = await categoryService.removeCategory(1);

            expect(result).toBe(true);
            expect(categoryRepo.destroy).toHaveBeenCalledWith(1);
        });

        test('Should throw 400 if category has sub-categories (children)', async () => {
            const mockCategory = { 
                id: 1, 
                children: [{ id: 2, name: 'Sub' }] 
            };

            categoryRepo.findById.mockResolvedValue(mockCategory);

            await expect(categoryService.removeCategory(1))
                .rejects.toThrow('Cannot delete category that has sub-categories');
            
            expect(categoryRepo.destroy).not.toHaveBeenCalled();
        });

        test('Should throw 404 if category not found', async () => {
            categoryRepo.findById.mockResolvedValue(null);

            await expect(categoryService.removeCategory(999))
                .rejects.toThrow('Category not found');
            
            expect(categoryRepo.destroy).not.toHaveBeenCalled();
        });
    });
});