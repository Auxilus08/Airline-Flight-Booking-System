/**
 * Booking Routes
 */

import express from 'express';
import BookingController from '../controllers/booking.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings
 */
router.get('/', BookingController.getAll);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 */
router.get('/:id', BookingController.getById);

/**
 * @route   GET /api/bookings/passenger/:passengerId
 * @desc    Get bookings by passenger ID
 */
router.get('/passenger/:passengerId', BookingController.getByPassengerId);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 */
router.post(
  '/',
  [
    body('passenger_id').isNumeric().withMessage('Valid passenger ID is required'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
    body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
    validate,
  ],
  BookingController.create
);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 */
router.patch(
  '/:id/status',
  [
    body('booking_status')
      .isIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
      .withMessage('Invalid booking status'),
    validate,
  ],
  BookingController.updateStatus
);

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel booking
 */
router.post('/:id/cancel', BookingController.cancel);

export default router;
