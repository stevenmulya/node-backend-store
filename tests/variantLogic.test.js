import { calculateVariantActions } from '../src/utils/variantUtils.js';

describe('Variant Synchronization Logic', () => {

    test('Should identify IDs to be DELETED', () => {
        const currentDbIds = [10, 11];
        const payloadFromFrontend = [
            { id: 10, name: 'Fixed Variant' }
        ];

        const result = calculateVariantActions(currentDbIds, payloadFromFrontend);

        expect(result.toDeleteIds).toEqual([11]);
        expect(result.toDeleteIds.length).toBe(1);
    });

    test('Should identify NEW items to be CREATED', () => {
        const currentDbIds = [];
        const payloadFromFrontend = [
            { name: 'New Variant', price: 5000 }
        ];

        const result = calculateVariantActions(currentDbIds, payloadFromFrontend);

        expect(result.toCreate.length).toBe(1);
        expect(result.toCreate[0].name).toBe('New Variant');
    });

    test('Should correctly categorize Delete, Update, and Create actions simultaneously', () => {
        const dbIds = [1, 2, 3];
        const payload = [
            { id: 1, name: 'Updated Item' }, 
            { name: 'New Item' }            
        ];

        const result = calculateVariantActions(dbIds, payload);

        expect(result.toDeleteIds).toEqual([2, 3]); 
        expect(result.toUpdate.length).toBe(1);     
        expect(result.toUpdate[0].id).toBe(1);      
        expect(result.toCreate.length).toBe(1);     
    });

});