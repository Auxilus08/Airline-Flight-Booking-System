/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

import PaymentModel from '../models/payment.model.js';
import BookingModel from '../models/booking.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const PaymentController = {
  /**
   * @route   GET /api/payments
   * @desc    Get all payments
   * @access  Private
   */
  getAll: asyncHandler(async (req, res) => {
    const payments = await PaymentModel.findAll();
    
    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  }),

  /**
   * @route   POST /api/payments
   * @desc    Process payment with transaction
   * @access  Private
   * 
   * Request body example:
   * {
   *   "booking_id": 300000,
   *   "amount": 5500.00,
   *   "payment_method": "CREDIT_CARD",
   *   "transaction_reference": "TXN20251028001"
   * }
   */
  processPayment: asyncHandler(async (req, res) => {
    const { booking_id, amount, payment_method, method, transaction_reference } = req.body;
    
    // Validate required fields
    if (!booking_id) {
      res.status(400);
      throw new Error('booking_id is required');
    }
    
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Valid amount is required');
    }
    
    const paymentMethodValue = payment_method || method;
    if (!paymentMethodValue) {
      res.status(400);
      throw new Error('payment_method is required');
    }
    
    // Validate payment method
    const validMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'];
    if (!validMethods.includes(paymentMethodValue)) {
      res.status(400);
      throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
    }
    
    try {
      // Process payment with transaction (updates booking status)
      const payment = await PaymentModel.processPayment({
        booking_id,
        amount,
        payment_method: paymentMethodValue,
        method: paymentMethodValue,
        transaction_reference,
      });
      
      // Fetch updated booking
      const booking = await BookingModel.findById(booking_id);
      
      res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          payment,
          booking,
        },
      });
    } catch (error) {
      res.status(400);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }),

  /**
   * @route   GET /api/payments/:bookingId
   * @desc    Get payments for a booking
   * @access  Private
   */
  getByBookingId: asyncHandler(async (req, res) => {
    const payments = await PaymentModel.findByBookingId(req.params.bookingId);
    
    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  }),

  /**
   * @route   GET /api/payments/detail/:id
   * @desc    Get payment by ID
   * @access  Private
   */
  getById: asyncHandler(async (req, res) => {
    const payment = await PaymentModel.findById(req.params.id);
    
    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }
    
    res.json({
      success: true,
      data: payment,
    });
  }),

  /**
   * @route   POST /api/payments/:id/refund
   * @desc    Process refund
   * @access  Private/Admin
   */
  refund: asyncHandler(async (req, res) => {
    const paymentId = req.params.id;
    
    // Check if payment exists
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }
    
    try {
      await PaymentModel.refund(paymentId);
      
      // Fetch updated payment
      const updatedPayment = await PaymentModel.findById(paymentId);
      
      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: updatedPayment,
      });
    } catch (error) {
      res.status(400);
      throw error;
    }
  }),
};

export default PaymentController;
