/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import UserModel from '../models/user.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const UserController = {
  /**
   * @route   POST /api/users/register
   * @desc    Register new user
   * @access  Public
   */
  register: asyncHandler(async (req, res) => {
    const { username, email, password, full_name, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Username, email, and password are required');
    }
    
    // Check if user already exists
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      res.status(400);
      throw new Error('Email already registered');
    }
    
    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      res.status(400);
      throw new Error('Username already taken');
    }
    
    // Create user
    const user = await UserModel.register({
      username,
      email,
      password,
      full_name,
      role: role || 'customer',
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  }),

  /**
   * @route   POST /api/users/login
   * @desc    Authenticate user
   * @access  Public
   */
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400);
      throw new Error('Username and password are required');
    }
    
    const user = await UserModel.authenticate(username, password);
    
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  }),

  /**
   * @route   GET /api/users/profile/:id
   * @desc    Get user profile
   * @access  Private
   */
  getProfile: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    res.json({
      success: true,
      data: user,
    });
  }),

  /**
   * @route   PUT /api/users/profile/:id
   * @desc    Update user profile
   * @access  Private
   */
  updateProfile: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { full_name, email } = req.body;
    
    // Check if email is being updated and already exists
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.USER_ID !== parseInt(userId)) {
        res.status(400);
        throw new Error('Email already in use');
      }
    }
    
    const user = await UserModel.updateProfile(userId, {
      full_name,
      email,
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }),

  /**
   * @route   PUT /api/users/password/:id
   * @desc    Change user password
   * @access  Private
   */
  changePassword: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { old_password, new_password } = req.body;
    
    if (!old_password || !new_password) {
      res.status(400);
      throw new Error('Old password and new password are required');
    }
    
    if (new_password.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters long');
    }
    
    try {
      await UserModel.changePassword(userId, old_password, new_password);
      
      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      res.status(400);
      throw error;
    }
  }),
};

export default UserController;
