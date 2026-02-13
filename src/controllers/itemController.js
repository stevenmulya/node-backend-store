import * as itemService from '../services/itemService.js';
import sendResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getItems = asyncHandler(async (req, res) => {
  const result = await itemService.getInventory(req.query);
  sendResponse(res, 200, 'Items retrieved', result.data, result.meta);
});

export const getItemById = asyncHandler(async (req, res) => {
  const result = await itemService.getItemDetails(req.params.id);
  sendResponse(res, 200, 'Item details retrieved', result);
});

export const addItem = asyncHandler(async (req, res) => {
  const result = await itemService.storeItem(req.body, req.user.id);
  sendResponse(res, 201, 'Item added successfully', result);
});

export const unpublishAll = asyncHandler(async (req, res) => {
  await itemService.massUnpublish(req.user.id);
  sendResponse(res, 200, 'All items archived successfully');
});