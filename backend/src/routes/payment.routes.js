/**
 * Payment Routes
 */

import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/payments
 * @desc    Get all payments
 */
router.get('/', PaymentController.getAll);

/**
 * @route   POST /api/payments
 * @desc    Process payment with transaction
 */
router.post('/',
  [
    body('booking_id').isInt({ min: 1 }).withMessage('Valid booking_id is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
    body('payment_method').optional().isIn(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET']).withMessage('Invalid payment method'),
    body('method').optional().isIn(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET']).withMessage('Invalid payment method'),
    body('transaction_reference').optional().trim().notEmpty().withMessage('Transaction reference cannot be empty'),
    validate,
  ],
  PaymentController.processPayment
);

/**
 * @route   GET /api/payments/:bookingId
 * @desc    Get payments for a booking
 */
router.get('/:bookingId',
  [
    param('bookingId').isInt({ min: 1 }).withMessage('Invalid booking ID'),
    validate,
  ],
  PaymentController.getByBookingId
);

/**
 * @route   GET /api/payments/detail/:id
 * @desc    Get payment by ID
 */
router.get('/detail/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid payment ID'),
    validate,
  ],
  PaymentController.getById
);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Process refund
 */
router.post('/:id/refund',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid payment ID'),
    validate,
  ],
  PaymentController.refund
);

export default router;
