export const calculateVariantActions = (currentDbIds, newVariantsPayload) => {
    const payloadIds = newVariantsPayload
        .filter(v => v.id) 
        .map(v => parseInt(v.id));

    const toDeleteIds = currentDbIds.filter(id => !payloadIds.includes(id));
    
    const toUpdate = newVariantsPayload.filter(v => v.id && currentDbIds.includes(parseInt(v.id)));
    
    const toCreate = newVariantsPayload.filter(v => !v.id);

    return { toDeleteIds, toUpdate, toCreate };
};