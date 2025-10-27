/**
 * Booking Controller
 * Handles HTTP requests for booking operations
 */

import BookingModel from '../models/booking.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const BookingController = {
  /**
   * @route   GET /api/bookings
   * @desc    Get all bookings
   * @access  Public
   */
  getAll: asyncHandler(async (req, res) => {
    const bookings = await BookingModel.findAll();
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  }),

  /**
   * @route   GET /api/bookings/:id
   * @desc    Get booking by ID
   * @access  Public
   */
  getById: asyncHandler(async (req, res) => {
    const booking = await BookingModel.findById(req.params.id);
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    res.json({
      success: true,
      data: booking,
    });
  }),

  /**
   * @route   GET /api/bookings/passenger/:passengerId
   * @desc    Get bookings by passenger ID
   * @access  Public
   */
  getByPassengerId: asyncHandler(async (req, res) => {
    const bookings = await BookingModel.findByPassengerId(req.params.passengerId);
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  }),

  /**
   * @route   POST /api/bookings
   * @desc    Create new booking
   * @access  Public
   */
  create: asyncHandler(async (req, res) => {
    const bookingId = await BookingModel.create(req.body);
    const booking = await BookingModel.findById(bookingId);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  }),

  /**
   * @route   PATCH /api/bookings/:id/status
   * @desc    Update booking status
   * @access  Public
   */
  updateStatus: asyncHandler(async (req, res) => {
    const { booking_status, payment_status } = req.body;
    
    if (!booking_status) {
      res.status(400);
      throw new Error('Booking status is required');
    }
    
    const booking = await BookingModel.updateStatus(
      req.params.id,
      booking_status,
      payment_status
    );
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  }),

  /**
   * @route   POST /api/bookings/:id/cancel
   * @desc    Cancel booking
   * @access  Public
   */
  cancel: asyncHandler(async (req, res) => {
    await BookingModel.cancel(req.params.id);
    const booking = await BookingModel.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  }),
};

export default BookingController;
