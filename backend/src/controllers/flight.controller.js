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
   * @desc    Search flights by origin, destination, and date
   * @access  Public
   */
  search: asyncHandler(async (req, res) => {
    const { from, to, date, origin, destination } = req.query;
    
    // Support both 'from/to' and 'origin/destination' parameter names
    const originCity = from || origin;
    const destinationCity = to || destination;
    
    if (!originCity || !destinationCity) {
      res.status(400);
      throw new Error('Origin (from) and destination (to) are required');
    }
    
    const flights = await FlightModel.search(originCity, destinationCity, date);
    
    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  }),

  /**
   * @route   POST /api/flights
   * @desc    Create new flight (Admin only)
   * @access  Private/Admin
   */
  create: asyncHandler(async (req, res) => {
    const flightData = req.body;
    
    // Validate required fields
    const requiredFields = ['airline_id', 'flight_number', 'origin_airport_id', 
                           'destination_airport_id', 'departure_time', 'arrival_time', 
                           'duration_minutes', 'price', 'available_seats'];
    
    for (const field of requiredFields) {
      if (!flightData[field]) {
        res.status(400);
        throw new Error(`${field} is required`);
      }
    }
    
    const flight = await FlightModel.create(flightData);
    
    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: flight,
    });
  }),

  /**
   * @route   PUT /api/flights/:id
   * @desc    Update flight (Admin only)
   * @access  Private/Admin
   */
  update: asyncHandler(async (req, res) => {
    const flightId = req.params.id;
    
    // Check if flight exists
    const existingFlight = await FlightModel.findById(flightId);
    if (!existingFlight) {
      res.status(404);
      throw new Error('Flight not found');
    }
    
    const flight = await FlightModel.update(flightId, req.body);
    
    res.json({
      success: true,
      message: 'Flight updated successfully',
      data: flight,
    });
  }),

  /**
   * @route   DELETE /api/flights/:id
   * @desc    Delete flight (Admin only)
   * @access  Private/Admin
   */
  delete: asyncHandler(async (req, res) => {
    const flightId = req.params.id;
    
    // Check if flight exists
    const existingFlight = await FlightModel.findById(flightId);
    if (!existingFlight) {
      res.status(404);
      throw new Error('Flight not found');
    }
    
    const deleted = await FlightModel.delete(flightId);
    
    if (!deleted) {
      res.status(400);
      throw new Error('Failed to delete flight');
    }
    
    res.json({
      success: true,
      message: 'Flight deleted successfully',
    });
  }),
};

export default FlightController;
