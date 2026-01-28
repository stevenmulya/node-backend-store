import fs from 'fs/promises';
import path from 'path';

const TEMPLATE_PATH = path.resolve('logs/attribute_templates.json');
const DATA_PATH = path.resolve('logs/product_attributes.json');

const ensureFile = async (filePath, defaultData = {}) => {
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, JSON.stringify(defaultData));
    }
};

export const getTemplates = async () => {
    await ensureFile(TEMPLATE_PATH);
    const data = await fs.readFile(TEMPLATE_PATH, 'utf-8');
    return JSON.parse(data);
};

export const saveTemplates = async (allTemplates) => {
    await fs.writeFile(TEMPLATE_PATH, JSON.stringify(allTemplates, null, 2));
};

export const getAttributes = async () => {
    await ensureFile(DATA_PATH);
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
};

export const saveAttributeData = async (productId, attributes) => {
    const allData = await getAttributes();
    allData[productId] = attributes;
    await fs.writeFile(DATA_PATH, JSON.stringify(allData, null, 2));
};

export const deleteAttributeData = async (productId) => {
    const allData = await getAttributes();
    delete allData[productId];
    await fs.writeFile(DATA_PATH, JSON.stringify(allData, null, 2));
};

export const filterProductIdsByAttributes = async (filters) => {
    const allData = await getAttributes();
    return Object.keys(allData).filter(productId => {
        return Object.entries(filters).every(([key, value]) => 
            allData[productId][key] && String(allData[productId][key]).toLowerCase() === String(value).toLowerCase()
        );
    });
};