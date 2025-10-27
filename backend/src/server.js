/**
 * Express Server Configuration
 * Main entry point for the Airline Ticket Booking System backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Import routes
import flightRoutes from './routes/flight.routes.js';
import passengerRoutes from './routes/passenger.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import airportRoutes from './routes/airport.routes.js';
import healthRoutes from './routes/health.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====================
// Middleware Setup
// ====================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// Routes
// ====================

// Health check and database status
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/flights', flightRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/airports', airportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Airline Ticket Booking System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      flights: '/api/flights',
      passengers: '/api/passengers',
      bookings: '/api/bookings',
      airports: '/api/airports',
    },
  });
});

// ====================
// Error Handling
// ====================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ====================
// Server Initialization
// ====================

/**
 * Start the server and initialize database connection
 */
async function startServer() {
  try {
    // Initialize Oracle Database connection pool
    await db.initialize();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log('='.repeat(50));
    });
    
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await db.close();
    console.log('✓ Server shut down successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err.message);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export default app;
