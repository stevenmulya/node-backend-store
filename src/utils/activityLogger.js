export const trackDiff = (oldData, newData, categoryMap = {}, attrTemplates = []) => {
    const updatedFields = [];
    const ignore = [
        'updated_at', 'created_at', 'updatedAt', 'createdAt', 
        'updated_by', 'created_by', 'deleted_by', 'deletedAt', 'id'
    ];

    Object.keys(newData).forEach(key => {
        if (ignore.includes(key) || key === 'attributes') return;

        let oldValue = oldData[key];
        let newValue = newData[key];

        if (oldValue === undefined) return;

        if (String(oldValue) !== String(newValue)) {
            const label = key === 'category_id' ? 'Category' : key.replace(/([A-Z])/g, ' $1');
            updatedFields.push(label.trim());
        }
    });

    if (newData.attributes) {
        const newAttrs = typeof newData.attributes === 'string' ? JSON.parse(newData.attributes) : newData.attributes;
        const oldAttrs = oldData.attributeValues || [];

        Object.entries(newAttrs).forEach(([templateId, newVal]) => {
            const oldEntry = oldAttrs.find(a => String(a.attribute_template_id) === String(templateId));
            const template = attrTemplates.find(t => String(t.id) === String(templateId));
            const attrName = template ? template.name : `Attribute #${templateId}`;

            if (!oldEntry || String(oldEntry.value) !== String(newVal)) {
                updatedFields.push(`Attribute: ${attrName}`);
            }
        });
    }

    return updatedFields.length > 0 ? updatedFields : null;
};