/**
 * Flight Routes
 */

import express from 'express';
import FlightController from '../controllers/flight.controller.js';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/flights
 * @desc    Get all flights with filters
 */
router.get('/', FlightController.getAll);

/**
 * @route   GET /api/flights/search
 * @desc    Search flights by origin, destination, and date
 */
router.get('/search',
  [
    query('from').optional().trim().notEmpty().withMessage('Origin cannot be empty'),
    query('to').optional().trim().notEmpty().withMessage('Destination cannot be empty'),
    query('origin').optional().trim().notEmpty().withMessage('Origin cannot be empty'),
    query('destination').optional().trim().notEmpty().withMessage('Destination cannot be empty'),
    query('date').optional().isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),
    validate,
  ],
  FlightController.search
);

/**
 * @route   GET /api/flights/:id
 * @desc    Get flight by ID
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid flight ID'),
    validate,
  ],
  FlightController.getById
);

/**
 * @route   POST /api/flights
 * @desc    Create new flight (Admin only)
 */
router.post('/',
  [
    body('airline_id').isInt({ min: 1 }).withMessage('Valid airline_id is required'),
    body('flight_number').trim().notEmpty().withMessage('Flight number is required'),
    body('origin_airport_id').isInt({ min: 1 }).withMessage('Valid origin_airport_id is required'),
    body('destination_airport_id').isInt({ min: 1 }).withMessage('Valid destination_airport_id is required'),
    body('departure_time').notEmpty().withMessage('Departure time is required'),
    body('arrival_time').notEmpty().withMessage('Arrival time is required'),
    body('duration_minutes').isInt({ min: 1 }).withMessage('Valid duration is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('available_seats').isInt({ min: 0 }).withMessage('Valid available_seats is required'),
    body('status').optional().isIn(['scheduled', 'on-time', 'delayed', 'cancelled', 'SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'DELAYED']).withMessage('Invalid status'),
    validate,
  ],
  FlightController.create
);

/**
 * @route   PUT /api/flights/:id
 * @desc    Update flight (Admin only)
 */
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid flight ID'),
    body('flight_number').optional().trim().notEmpty().withMessage('Flight number cannot be empty'),
    body('departure_time').optional().notEmpty().withMessage('Departure time cannot be empty'),
    body('arrival_time').optional().notEmpty().withMessage('Arrival time cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('available_seats').optional().isInt({ min: 0 }).withMessage('Available seats must be non-negative'),
    body('status').optional().isIn(['scheduled', 'on-time', 'delayed', 'cancelled', 'SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'DELAYED']).withMessage('Invalid status'),
    validate,
  ],
  FlightController.update
);

/**
 * @route   DELETE /api/flights/:id
 * @desc    Delete flight (Admin only)
 */
router.delete('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid flight ID'),
    validate,
  ],
  FlightController.delete
);

export default router;
