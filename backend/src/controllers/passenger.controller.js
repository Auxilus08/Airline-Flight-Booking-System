/**
 * Passenger Controller
 * Handles HTTP requests for passenger operations
 */

import PassengerModel from '../models/passenger.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const PassengerController = {
  /**
   * @route   GET /api/passengers
   * @desc    Get all passengers
   * @access  Public
   */
  getAll: asyncHandler(async (req, res) => {
    const passengers = await PassengerModel.findAll();
    
    res.json({
      success: true,
      count: passengers.length,
      data: passengers,
    });
  }),

  /**
   * @route   GET /api/passengers/:id
   * @desc    Get passenger by ID
   * @access  Public
   */
  getById: asyncHandler(async (req, res) => {
    const passenger = await PassengerModel.findById(req.params.id);
    
    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found');
    }
    
    res.json({
      success: true,
      data: passenger,
    });
  }),

  /**
   * @route   POST /api/passengers
   * @desc    Create new passenger
   * @access  Public
   */
  create: asyncHandler(async (req, res) => {
    // Check if email already exists
    const existing = await PassengerModel.findByEmail(req.body.email);
    if (existing) {
      res.status(400);
      throw new Error('Email already registered');
    }
    
    const passenger = await PassengerModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Passenger created successfully',
      data: passenger,
    });
  }),

  /**
   * @route   PUT /api/passengers/:id
   * @desc    Update passenger
   * @access  Public
   */
  update: asyncHandler(async (req, res) => {
    const passenger = await PassengerModel.findById(req.params.id);
    
    if (!passenger) {
      res.status(404);
      throw new Error('Passenger not found');
    }
    
    const updated = await PassengerModel.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Passenger updated successfully',
      data: updated,
    });
  }),

  /**
   * @route   DELETE /api/passengers/:id
   * @desc    Delete passenger
   * @access  Public
   */
  delete: asyncHandler(async (req, res) => {
    const deleted = await PassengerModel.delete(req.params.id);
    
    if (!deleted) {
      res.status(404);
      throw new Error('Passenger not found');
    }
    
    res.json({
      success: true,
      message: 'Passenger deleted successfully',
    });
  }),
};

export default PassengerController;
