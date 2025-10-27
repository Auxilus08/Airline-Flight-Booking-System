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
   * @access  Private/Admin
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
   * @access  Private
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
   * @route   GET /api/bookings/user/:userId
   * @desc    Get bookings by user ID
   * @access  Private
   */
  getByUserId: asyncHandler(async (req, res) => {
    const bookings = await BookingModel.findByUserId(req.params.userId);
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  }),

  /**
   * @route   GET /api/bookings/passenger/:passengerId
   * @desc    Get bookings by passenger ID
   * @access  Private
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
   * @desc    Create new booking with ACID transaction
   * @access  Private
   * 
   * Request body example:
   * {
   *   "passenger_id": 50000,
   *   "user_id": 2000,
   *   "tickets": [
   *     {
   *       "flight_id": 10000,
   *       "seat_id": 1,
   *       "seat_number": "12A",
   *       "fare_class": "Economy",
   *       "class_type": "ECONOMY",
   *       "price": 5500.00
   *     }
   *   ]
   * }
   */
  create: asyncHandler(async (req, res) => {
    const { passenger_id, user_id, tickets } = req.body;
    
    // Validate required fields
    if (!passenger_id) {
      res.status(400);
      throw new Error('passenger_id is required');
    }
    
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      res.status(400);
      throw new Error('At least one ticket is required');
    }
    
    // Validate each ticket
    for (const ticket of tickets) {
      if (!ticket.flight_id || !ticket.price) {
        res.status(400);
        throw new Error('Each ticket must have flight_id and price');
      }
    }
    
    // Calculate total amount
    const total_amount = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0);
    
    const bookingData = {
      passenger_id,
      user_id,
      total_amount,
      status: 'pending',
      payment_status: 'PENDING',
      tickets,
    };
    
    try {
      // Create booking with ACID transaction
      const result = await BookingModel.create(bookingData);
      
      // Fetch the complete booking details
      const booking = await BookingModel.findById(result.bookingId);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          booking_id: result.bookingId,
          ticket_ids: result.ticketIds,
          booking: booking,
        },
      });
    } catch (error) {
      // Transaction automatically rolled back
      res.status(400);
      throw new Error(`Booking failed: ${error.message}`);
    }
  }),

  /**
   * @route   PUT /api/bookings/:id/cancel
   * @desc    Cancel booking
   * @access  Private
   */
  cancel: asyncHandler(async (req, res) => {
    const bookingId = req.params.id;
    
    // Check if booking exists
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    // Check if booking is already cancelled
    if (booking.STATUS === 'cancelled' || booking.STATUS === 'CANCELLED') {
      res.status(400);
      throw new Error('Booking is already cancelled');
    }
    
    // Cancel booking (transaction will restore seats)
    await BookingModel.cancel(bookingId);
    
    // Fetch updated booking
    const updatedBooking = await BookingModel.findById(bookingId);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking,
    });
  }),

  /**
   * @route   PATCH /api/bookings/:id/status
   * @desc    Update booking status
   * @access  Private/Admin
   */
  updateStatus: asyncHandler(async (req, res) => {
    const { booking_status, payment_status, status } = req.body;
    
    const bookingStatus = status || booking_status;
    
    if (!bookingStatus) {
      res.status(400);
      throw new Error('status or booking_status is required');
    }
    
    const booking = await BookingModel.updateStatus(
      req.params.id,
      bookingStatus,
      payment_status
    );
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  }),
};

export default BookingController;
