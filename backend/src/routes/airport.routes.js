/**
 * Airport Routes
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import db from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/airports
 * @desc    Get all airports
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT 
        airport_id,
        name AS airport_name,
        code AS airport_code,
        city,
        country,
        timezone,
        created_at
      FROM AIRPORTS
      ORDER BY city
    `;
    
    const airports = await db.query(sql);
    
    res.json({
      success: true,
      count: airports.length,
      data: airports,
    });
  })
);

/**
 * @route   GET /api/airports/:id
 * @desc    Get airport by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT 
        airport_id,
        name AS airport_name,
        code AS airport_code,
        city,
        country,
        timezone,
        created_at
      FROM AIRPORTS
      WHERE airport_id = :id
    `;
    
    const airport = await db.queryOne(sql, { id: req.params.id });
    
    if (!airport) {
      res.status(404);
      throw new Error('Airport not found');
    }
    
    res.json({
      success: true,
      data: airport,
    });
  })
);

export default router;
