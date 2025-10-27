/**
 * Oracle Database Connection Module
 * Manages connection pool, query execution, and transactions
 */

import oracledb from 'oracledb';
import dbConfig from './db.config.js';

// Set default fetch type to object for easier JSON handling
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Enable auto-commit globally (can be overridden per query)
oracledb.autoCommit = dbConfig.autoCommit;

// Fetch array size for better performance with large result sets
oracledb.fetchArraySize = dbConfig.fetchArraySize;

let pool = null;

/**
 * Initialize Oracle Database connection pool
 * @returns {Promise<void>}
 */
async function initialize() {
  try {
    console.log('Initializing Oracle Database connection pool...');
    
    pool = await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolMin: dbConfig.poolMin,
      poolMax: dbConfig.poolMax,
      poolIncrement: dbConfig.poolIncrement,
      poolTimeout: dbConfig.poolTimeout,
      poolAlias: dbConfig.poolAlias,
      stmtCacheSize: dbConfig.stmtCacheSize,
      enableHealthCheck: dbConfig.enableHealthCheck,
      healthCheckInterval: dbConfig.healthCheckInterval,
    });

    console.log('✓ Oracle Database connection pool created successfully');
    console.log(`  Pool Alias: ${dbConfig.poolAlias}`);
    console.log(`  Min Connections: ${dbConfig.poolMin}`);
    console.log(`  Max Connections: ${dbConfig.poolMax}`);
    
    // Test the connection
    const connection = await pool.getConnection();
    const result = await connection.execute('SELECT SYSDATE FROM DUAL');
    console.log(`✓ Database connection test successful (Server time: ${result.rows[0].SYSDATE})`);
    await connection.close();
    
  } catch (err) {
    console.error('✗ Error initializing Oracle Database connection pool:', err.message);
    throw err;
  }
}

/**
 * Close the connection pool
 * @returns {Promise<void>}
 */
async function close() {
  try {
    if (pool) {
      console.log('Closing Oracle Database connection pool...');
      await pool.close(10); // 10 seconds drain time
      pool = null;
      console.log('✓ Connection pool closed successfully');
    }
  } catch (err) {
    console.error('✗ Error closing connection pool:', err.message);
    throw err;
  }
}

/**
 * Execute a SQL query
 * @param {string} sql - SQL query string
 * @param {Array|Object} binds - Bind parameters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query result
 */
async function execute(sql, binds = [], options = {}) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : false,
      ...options,
    });
    
    return result;
    
  } catch (err) {
    console.error('Database query error:', err.message);
    console.error('SQL:', sql);
    console.error('Binds:', binds);
    throw err;
    
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    }
  }
}

/**
 * Execute a SQL query and return only rows
 * @param {string} sql - SQL query string
 * @param {Array|Object} binds - Bind parameters
 * @returns {Promise<Array>} Query result rows
 */
async function query(sql, binds = []) {
  const result = await execute(sql, binds);
  return result.rows || [];
}

/**
 * Execute a SQL query and return the first row
 * @param {string} sql - SQL query string
 * @param {Array|Object} binds - Bind parameters
 * @returns {Promise<Object|null>} First row or null
 */
async function queryOne(sql, binds = []) {
  const result = await execute(sql, binds);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Execute multiple statements in a transaction
 * @param {Function} callback - Async function that receives connection object
 * @returns {Promise<any>} Result of the callback
 */
async function transaction(callback) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Begin transaction (implicit in Oracle)
    const result = await callback(connection);
    
    // Commit transaction
    await connection.commit();
    
    return result;
    
  } catch (err) {
    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr.message);
      }
    }
    
    console.error('Transaction error:', err.message);
    throw err;
    
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    }
  }
}

/**
 * Execute a batch insert/update/delete operation
 * @param {string} sql - SQL DML statement
 * @param {Array} binds - Array of bind parameter arrays
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Execution result
 */
async function executeMany(sql, binds = [], options = {}) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const result = await connection.executeMany(sql, binds, {
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : true,
      batchErrors: true,
      ...options,
    });
    
    return result;
    
  } catch (err) {
    console.error('Batch execution error:', err.message);
    console.error('SQL:', sql);
    throw err;
    
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    }
  }
}

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
function getPoolStatistics() {
  if (pool) {
    return {
      poolAlias: pool.poolAlias,
      connectionsOpen: pool.connectionsOpen,
      connectionsInUse: pool.connectionsInUse,
      poolMin: pool.poolMin,
      poolMax: pool.poolMax,
      poolIncrement: pool.poolIncrement,
      poolTimeout: pool.poolTimeout,
      stmtCacheSize: pool.stmtCacheSize,
    };
  }
  return null;
}

/**
 * Check if pool is initialized
 * @returns {boolean}
 */
function isInitialized() {
  return pool !== null;
}

export default {
  initialize,
  close,
  execute,
  query,
  queryOne,
  transaction,
  executeMany,
  getPoolStatistics,
  isInitialized,
  oracledb, // Export oracledb for advanced usage
};
