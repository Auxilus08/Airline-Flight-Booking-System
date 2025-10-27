/**
 * Oracle Database Configuration
 * Contains connection pool settings and database credentials
 */

import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
  
  // Connection Pool Configuration
  poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
  poolIncrement: parseInt(process.env.DB_POOL_INCREMENT) || 2,
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT) || 60,
  
  // Additional Oracle DB settings
  poolAlias: 'airline_booking_pool',
  
  // Enable statement caching for better performance
  stmtCacheSize: 30,
  
  // Auto-commit transactions (set to false for manual control)
  autoCommit: false,
  
  // Fetch array size for result sets
  fetchArraySize: 100,
  
  // Output format for queries
  outFormat: 4001, // oracledb.OUT_FORMAT_OBJECT
  
  // Connection health check
  enableHealthCheck: true,
  healthCheckInterval: 60000, // 60 seconds
};

export default dbConfig;
