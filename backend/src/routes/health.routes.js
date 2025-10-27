/**
 * Health Check Routes
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import db from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
    
    res.json(health);
  })
);

/**
 * @route   GET /api/health/db
 * @desc    Database connection health check
 */
router.get(
  '/db',
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    // Test database connection
    const result = await db.queryOne('SELECT SYSDATE FROM DUAL');
    const responseTime = Date.now() - startTime;
    
    // Get pool statistics
    const poolStats = db.getPoolStatistics();
    
    res.json({
      status: 'OK',
      database: {
        connected: true,
        serverTime: result.SYSDATE,
        responseTime: `${responseTime}ms`,
      },
      connectionPool: poolStats,
    });
  })
);

export default router;
