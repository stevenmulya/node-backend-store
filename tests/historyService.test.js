import * as historyService from '../src/services/historyService.js';
import * as historyRepo from '../src/repositories/historyRepository.js';

jest.mock('../src/repositories/historyRepository.js');

describe('History Service Logic', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('recordActivity', () => {
        test('Should call repository with correct payload structure', async () => {
            historyRepo.createHistory.mockResolvedValue({ id: 100 });

            const productId = 1;
            const productName = 'Laptop';
            const action = 'UPDATED';
            const userId = 5;
            const details = { price_change: '100 to 200' };
            const transaction = 'mock-transaction';

            const result = await historyService.recordActivity(
                productId, productName, action, userId, details, transaction
            );

            expect(result).toEqual({ id: 100 });
            expect(historyRepo.createHistory).toHaveBeenCalledWith({
                product_id: productId,
                product_name_at_time: productName,
                action: action,
                performed_by: userId,
                details: details
            }, transaction);
        });

        test('Should handle default values for details and transaction', async () => {
            historyRepo.createHistory.mockResolvedValue({ id: 101 });

            await historyService.recordActivity(1, 'Mouse', 'DELETED', 5);

            expect(historyRepo.createHistory).toHaveBeenCalledWith({
                product_id: 1,
                product_name_at_time: 'Mouse',
                action: 'DELETED',
                performed_by: 5,
                details: {}
            }, null);
        });
    });

    describe('getHistoryByProduct', () => {
        test('Should return list of history for a product', async () => {
            const mockHistory = [
                { id: 1, action: 'CREATED' },
                { id: 2, action: 'UPDATED' }
            ];
            historyRepo.findByProductId.mockResolvedValue(mockHistory);

            const result = await historyService.getHistoryByProduct(10);

            expect(result).toEqual(mockHistory);
            expect(historyRepo.findByProductId).toHaveBeenCalledWith(10);
        });
    });
});