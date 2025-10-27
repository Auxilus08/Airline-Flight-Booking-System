/**
 * Booking Routes
 */

import express from 'express';
import BookingController from '../controllers/booking.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings
 */
router.get('/', BookingController.getAll);

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Get bookings by user ID (must come before /:id to avoid conflict)
 */
router.get('/user/:userId',
  [
    param('userId').isInt({ min: 1 }).withMessage('Invalid user ID'),
    validate,
  ],
  BookingController.getByUserId
);

/**
 * @route   GET /api/bookings/passenger/:passengerId
 * @desc    Get bookings by passenger ID
 */
router.get('/passenger/:passengerId',
  [
    param('passengerId').isInt({ min: 1 }).withMessage('Invalid passenger ID'),
    validate,
  ],
  BookingController.getByPassengerId
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    validate,
  ],
  BookingController.getById
);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking with ACID transaction
 */
router.post(
  '/',
  [
    body('passenger_id').isInt({ min: 1 }).withMessage('Valid passenger_id is required'),
    body('user_id').optional().isInt({ min: 1 }).withMessage('user_id must be a positive integer'),
    body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
    body('tickets.*.flight_id').isInt({ min: 1 }).withMessage('Each ticket must have a valid flight_id'),
    body('tickets.*.price').isFloat({ min: 0 }).withMessage('Each ticket must have a valid price'),
    body('tickets.*.seat_id').optional().isInt({ min: 1 }).withMessage('seat_id must be a positive integer'),
    body('tickets.*.seat_number').optional().trim().notEmpty().withMessage('seat_number cannot be empty'),
    body('tickets.*.fare_class').optional().trim().notEmpty().withMessage('fare_class cannot be empty'),
    body('tickets.*.class_type').optional().isIn(['ECONOMY', 'BUSINESS', 'FIRST_CLASS']).withMessage('Invalid class_type'),
    validate,
  ],
  BookingController.create
);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel booking
 */
router.put('/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    validate,
  ],
  BookingController.cancel
);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 */
router.patch(
  '/:id/status',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid status'),
    body('booking_status').optional().isIn(['pending', 'confirmed', 'cancelled', 'PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid booking_status'),
    body('payment_status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Invalid payment_status'),
    validate,
  ],
  BookingController.updateStatus
);

/**
 * @route   POST /api/bookings/:id/cancel (alternative route for compatibility)
 * @desc    Cancel booking
 */
router.post('/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    validate,
  ],
  BookingController.cancel
);

export default router;
