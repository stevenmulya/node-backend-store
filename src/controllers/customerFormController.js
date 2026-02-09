import CustomerFormField from '../models/customer/customerFormFieldModel.js';
import CustomerResponse from '../models/customer/customerResponseModel.js';
import sendResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Sequelize } from 'sequelize';

export const getFields = asyncHandler(async (req, res) => {
    const fields = await CustomerFormField.findAll({
        order: [['createdAt', 'ASC']]
    });

    const fieldsWithStats = await Promise.all(fields.map(async (field) => {
        const stats = await CustomerResponse.findAll({
            attributes: [
                'answer',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: { field_id: field.id },
            group: ['answer'],
            order: [[Sequelize.literal('count'), 'DESC']],
            raw: true
        });

        const timeRange = await CustomerResponse.findOne({
            attributes: [
                [Sequelize.fn('MIN', Sequelize.col('created_at')), 'first_response'],
                [Sequelize.fn('MAX', Sequelize.col('created_at')), 'last_response']
            ],
            where: { field_id: field.id },
            raw: true
        });

        const statsMap = {};
        let total = 0;
        
        stats.forEach(s => {
            const count = parseInt(s.count);
            statsMap[s.answer] = count;
            total += count;
        });

        let topAnswers = [];
        if (stats.length > 0) {
            const maxCount = parseInt(stats[0].count);
            topAnswers = stats
                .filter(s => parseInt(s.count) === maxCount)
                .map(s => s.answer);
        }

        return {
            ...field.toJSON(),
            stats: {
                counts: statsMap,
                total: total,
                topAnswers: topAnswers,
                firstResponse: timeRange?.first_response || null,
                lastResponse: timeRange?.last_response || null
            }
        };
    }));

    sendResponse(res, 200, 'Fields retrieved successfully', fieldsWithStats);
});

export const createField = asyncHandler(async (req, res) => {
    const { label, options, is_required } = req.body;
    const field_key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    const existing = await CustomerFormField.findOne({ where: { field_key } });
    if (existing) return sendResponse(res, 400, 'Question already exists');
    const field = await CustomerFormField.create({ label, field_key, options, is_required });
    sendResponse(res, 201, 'Question created', field);
});

export const deleteField = asyncHandler(async (req, res) => {
    await CustomerFormField.destroy({ where: { id: req.params.id } });
    sendResponse(res, 200, 'Question deleted');
});

export const toggleActive = asyncHandler(async (req, res) => {
    const field = await CustomerFormField.findByPk(req.params.id);
    if (!field) return sendResponse(res, 404, 'Not found');
    await field.update({ is_active: !field.is_active });
    sendResponse(res, 200, 'Visibility toggled', field);
});