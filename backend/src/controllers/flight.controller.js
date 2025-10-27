/**
 * Flight Controller
 * Handles HTTP requests for flight operations
 */

import FlightModel from '../models/flight.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const FlightController = {
  /**
   * @route   GET /api/flights
   * @desc    Get all flights with optional filters
   * @access  Public
   */
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      origin: req.query.origin,
      destination: req.query.destination,
      status: req.query.status,
    };
    
    const flights = await FlightModel.findAll(filters);
    
    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  }),

  /**
   * @route   GET /api/flights/:id
   * @desc    Get flight by ID
   * @access  Public
   */
  getById: asyncHandler(async (req, res) => {
    const flight = await FlightModel.findById(req.params.id);
    
    if (!flight) {
      res.status(404);
      throw new Error('Flight not found');
    }
    
    res.json({
      success: true,
      data: flight,
    });
  }),

  /**
   * @route   GET /api/flights/search
   * @desc    Search flights by origin and destination
   * @access  Public
   */
  search: asyncHandler(async (req, res) => {
    const { origin, destination, date } = req.query;
    
    if (!origin || !destination) {
      res.status(400);
      throw new Error('Origin and destination are required');
    }
    
    const flights = await FlightModel.search(origin, destination, date);
    
    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  }),
};

export default FlightController;
