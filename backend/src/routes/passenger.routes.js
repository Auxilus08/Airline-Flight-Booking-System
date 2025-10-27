/**
 * Passenger Routes
 */

import express from 'express';
import PassengerController from '../controllers/passenger.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/passengers
 * @desc    Get all passengers
 */
router.get('/', PassengerController.getAll);

/**
 * @route   GET /api/passengers/:id
 * @desc    Get passenger by ID
 */
router.get('/:id', PassengerController.getById);

/**
 * @route   POST /api/passengers
 * @desc    Create new passenger
 */
router.post(
  '/',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('passport_number').notEmpty().withMessage('Passport number is required'),
    body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
    validate,
  ],
  PassengerController.create
);

/**
 * @route   PUT /api/passengers/:id
 * @desc    Update passenger
 */
router.put(
  '/:id',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  PassengerController.update
);

/**
 * @route   DELETE /api/passengers/:id
 * @desc    Delete passenger
 */
router.delete('/:id', PassengerController.delete);

export default router;
