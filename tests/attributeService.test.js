import * as attributeService from '../src/services/attributeService.js';
import AttributeTemplate from '../src/models/attributeTemplateModel.js';
import ProductAttribute from '../src/models/productAttributeModel.js';
import * as categoryRepo from '../src/repositories/categoryRepository.js';

jest.mock('../src/models/attributeTemplateModel.js');
jest.mock('../src/models/productAttributeModel.js');
jest.mock('../src/repositories/categoryRepository.js');

describe('Attribute Service Logic', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTemplates', () => {
        test('Should return templates based on category ancestors', async () => {
            const categoryId = 5;
            const ancestorIds = [1, 5];
            const mockTemplates = [{ id: 1, name: 'Color' }];

            categoryRepo.getAncestors.mockResolvedValue(ancestorIds);
            AttributeTemplate.findAll.mockResolvedValue(mockTemplates);

            const result = await attributeService.getTemplates(categoryId);

            expect(result).toEqual(mockTemplates);
            expect(categoryRepo.getAncestors).toHaveBeenCalledWith(categoryId);
            expect(AttributeTemplate.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.any(Object),
                order: [['category_id', 'ASC']]
            }));
        });
    });

    describe('getAllTemplates', () => {
        test('Should return all templates ordered by category', async () => {
            const mockTemplates = [{ id: 1 }, { id: 2 }];
            AttributeTemplate.findAll.mockResolvedValue(mockTemplates);

            const result = await attributeService.getAllTemplates();

            expect(result).toEqual(mockTemplates);
            expect(AttributeTemplate.findAll).toHaveBeenCalledWith({ order: [['category_id', 'ASC']] });
        });
    });

    describe('updateTemplates', () => {
        test('Should destroy old templates and create new ones', async () => {
            const categoryId = 10;
            const fields = [{ name: 'Size', type: 'text' }];
            const transaction = 'mock-trx';

            AttributeTemplate.destroy.mockResolvedValue(1);
            AttributeTemplate.bulkCreate.mockResolvedValue(fields);

            const result = await attributeService.updateTemplates(categoryId, fields, transaction);

            expect(AttributeTemplate.destroy).toHaveBeenCalledWith({
                where: { category_id: categoryId },
                transaction
            });

            expect(AttributeTemplate.bulkCreate).toHaveBeenCalledWith(
                [{ ...fields[0], category_id: categoryId }],
                { transaction }
            );
            expect(result).toEqual(fields);
        });
    });

    describe('syncProductAttributes', () => {
        test('Should sync attributes when input is an Object', async () => {
            const productId = 100;
            const attributes = { "1": "Red", "2": "L" };
            const transaction = 'mock-trx';

            ProductAttribute.destroy.mockResolvedValue(1);
            ProductAttribute.bulkCreate.mockResolvedValue(true);

            await attributeService.syncProductAttributes(productId, attributes, transaction);

            expect(ProductAttribute.destroy).toHaveBeenCalledWith({
                where: { product_id: productId },
                transaction
            });

            const expectedPayload = [
                { product_id: productId, attribute_template_id: "1", value: "Red" },
                { product_id: productId, attribute_template_id: "2", value: "L" }
            ];

            expect(ProductAttribute.bulkCreate).toHaveBeenCalledWith(expectedPayload, { transaction });
        });

        test('Should sync attributes when input is a JSON String', async () => {
            const productId = 100;
            const attributes = JSON.stringify({ "1": "Blue" });
            const transaction = 'mock-trx';

            ProductAttribute.destroy.mockResolvedValue(1);
            ProductAttribute.bulkCreate.mockResolvedValue(true);

            await attributeService.syncProductAttributes(productId, attributes, transaction);

            expect(ProductAttribute.bulkCreate).toHaveBeenCalledWith([
                { product_id: productId, attribute_template_id: "1", value: "Blue" }
            ], { transaction });
        });

        test('Should only destroy attributes if input is null', async () => {
            const productId = 100;
            const transaction = 'mock-trx';

            ProductAttribute.destroy.mockResolvedValue(1);

            await attributeService.syncProductAttributes(productId, null, transaction);

            expect(ProductAttribute.destroy).toHaveBeenCalledWith({
                where: { product_id: productId },
                transaction
            });
            expect(ProductAttribute.bulkCreate).not.toHaveBeenCalled();
        });
    });
});