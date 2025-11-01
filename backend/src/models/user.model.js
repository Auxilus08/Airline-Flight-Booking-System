/**
 * User Model
 * Database queries for user operations
 */

import db from '../config/db.js';
import crypto from 'crypto';

const UserModel = {
  /**
   * Hash password using SHA-256
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const sql = `
      SELECT 
        user_id,
        username,
        email,
        full_name,
        role,
        active,
        created_at
      FROM USERS
      WHERE LOWER(email) = LOWER(:email)
    `;
    
    return await db.queryOne(sql, { email });
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const sql = `
      SELECT 
        user_id,
        username,
        email,
        full_name,
        role,
        active,
        created_at
      FROM USERS
      WHERE LOWER(username) = LOWER(:username)
    `;
    
    return await db.queryOne(sql, { username });
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const sql = `
      SELECT 
        user_id,
        username,
        email,
        full_name,
        role,
        active,
        created_at
      FROM USERS
      WHERE user_id = :id
    `;
    
    return await db.queryOne(sql, { id });
  },

  /**
   * Register new user
   */
  async register(userData) {
    const sql = `
      INSERT INTO USERS (
        username,
        password_hash,
        email,
        full_name,
        role,
        active
      ) VALUES (
        :username,
        :password_hash,
        :email,
        :full_name,
        :role,
        :active
      ) RETURNING user_id INTO :id
    `;

    const binds = {
      username: userData.username,
      password_hash: this.hashPassword(userData.password),
      email: userData.email,
      full_name: userData.full_name || null,
      role: userData.role || 'customer',
      active: 1,
      created_at: userData.created_at || { val: new Date(), dir: db.oracledb.BIND_IN },
      id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    };

    const result = await db.execute(sql, binds, { autoCommit: true });
    const userId = result.outBinds.id[0];
    return await this.findById(userId);
  },

  /**
   * Authenticate user
   */
  async authenticate(username, password) {
    const sql = `
      SELECT 
        user_id,
        username,
        password_hash,
        email,
        full_name,
        role,
        active,
        created_at
      FROM USERS
      WHERE (LOWER(username) = LOWER(:username) OR LOWER(email) = LOWER(:username))
        AND active = 1
    `;

    const user = await db.queryOne(sql, { username });
    
    if (!user) {
      return null;
    }

    const hashedPassword = this.hashPassword(password);
    
    if (user.PASSWORD_HASH === hashedPassword) {
      // Remove password hash from returned object
      delete user.PASSWORD_HASH;
      return user;
    }

    return null;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, userData) {
    const fields = [];
    const binds = { user_id: userId };

    if (userData.full_name) {
      fields.push('full_name = :full_name');
      binds.full_name = userData.full_name;
    }
    if (userData.email) {
      fields.push('email = :email');
      binds.email = userData.email;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const sql = `UPDATE USERS SET ${fields.join(', ')} WHERE user_id = :user_id`;
    await db.execute(sql, binds, { autoCommit: true });
    return await this.findById(userId);
  },

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const sql = `
      SELECT password_hash
      FROM USERS
      WHERE user_id = :user_id
    `;

    const user = await db.queryOne(sql, { user_id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    const oldHashedPassword = this.hashPassword(oldPassword);
    
    if (user.PASSWORD_HASH !== oldHashedPassword) {
      throw new Error('Current password is incorrect');
    }

    const newHashedPassword = this.hashPassword(newPassword);
    
    await db.execute(
      `UPDATE USERS SET password_hash = :password_hash WHERE user_id = :user_id`,
      { password_hash: newHashedPassword, user_id: userId },
      { autoCommit: true }
    );

    return true;
  },
};

export default UserModel;
