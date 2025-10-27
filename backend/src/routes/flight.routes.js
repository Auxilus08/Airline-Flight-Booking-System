/**
 * Flight Routes
 */

import express from 'express';
import FlightController from '../controllers/flight.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/flights
 * @desc    Get all flights
 */
router.get('/', FlightController.getAll);

/**
 * @route   GET /api/flights/search
 * @desc    Search flights
 */
router.get('/search', FlightController.search);

/**
 * @route   GET /api/flights/:id
 * @desc    Get flight by ID
 */
router.get('/:id', FlightController.getById);

export default router;
