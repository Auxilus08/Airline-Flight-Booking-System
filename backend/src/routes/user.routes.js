/**
 * User Routes
 */

import express from 'express';
import UserController from '../controllers/user.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 */
router.post('/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('full_name').optional().trim().isLength({ max: 200 }).withMessage('Full name cannot exceed 200 characters'),
    body('role').optional().isIn(['customer', 'agent', 'admin']).withMessage('Invalid role'),
    validate,
  ],
  UserController.register
);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user
 */
router.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  UserController.login
);

/**
 * @route   GET /api/users/profile/:id
 * @desc    Get user profile
 */
router.get('/profile/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    validate,
  ],
  UserController.getProfile
);

router.get('/', UserController.getAllUsers);

/**
 * @route   PUT /api/users/profile/:id
 * @desc    Update user profile
 */
router.put('/profile/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('full_name').optional().trim().isLength({ max: 200 }).withMessage('Full name cannot exceed 200 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate,
  ],
  UserController.updateProfile
);

/**
 * @route   PUT /api/users/password/:id
 * @desc    Change user password
 */
router.put('/password/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('old_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validate,
  ],
  UserController.changePassword
);

export default router;
