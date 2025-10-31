/**
 * Passenger Model
 * Database queries for passenger operations
 */

import db from '../config/db.js';

const PassengerModel = {
  /**
   * Get all passengers
   */
  async findAll() {
    const sql = `
      SELECT 
        passenger_id,
        first_name,
        last_name,
        email,
        phone,
        passport_number,
        date_of_birth,
        nationality,
        created_at
      FROM PASSENGERS
      ORDER BY created_at DESC
    `;
    
    return await db.query(sql);
  },

  /**
   * Get passenger by ID
   */
  async findById(id) {
    const sql = `
      SELECT 
        passenger_id,
        first_name,
        last_name,
        email,
        phone,
        passport_number,
        date_of_birth,
        nationality,
        created_at
      FROM PASSENGERS
      WHERE passenger_id = :id
    `;
    
    return await db.queryOne(sql, [id]);
  },

  /**
   * Get passenger by email
   */
  async findByEmail(email) {
    const sql = `
      SELECT 
        passenger_id,
        first_name,
        last_name,
        email,
        phone,
        passport_number,
        date_of_birth,
        nationality,
        created_at
      FROM PASSENGERS
      WHERE UPPER(email) = UPPER(:email)
    `;
    
    return await db.queryOne(sql, [email]);
  },

  /**
   * Create new passenger
   */
  async create(passengerData) {
    const sql = `
      INSERT INTO PASSENGERS (
        passenger_id,
        first_name,
        last_name,
        email,
        phone,
        passport_number,
        date_of_birth,
        nationality
      ) VALUES (
        passenger_seq.NEXTVAL,
        :first_name,
        :last_name,
        :email,
        :phone,
        :passport_number,
        TO_DATE(:date_of_birth, 'YYYY-MM-DD'),
        :nationality
      ) RETURNING passenger_id INTO :id
    `;
    
    const binds = {
      first_name: passengerData.first_name,
      last_name: passengerData.last_name,
      email: passengerData.email,
      phone: passengerData.phone || null,
      passport_number: passengerData.passport_number,
      date_of_birth: passengerData.date_of_birth,
      nationality: passengerData.nationality || null,
      id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    };
    
    const result = await db.execute(sql, binds, { autoCommit: true });
    const passengerId = result.outBinds.id[0];
    
    return await this.findById(passengerId);
  },

  /**
   * Update passenger
   */
  async update(id, passengerData) {
    const sql = `
      UPDATE PASSENGERS SET
        first_name = :first_name,
        last_name = :last_name,
        email = :email,
        phone = :phone,
        passport_number = :passport_number,
        date_of_birth = TO_DATE(:date_of_birth, 'YYYY-MM-DD'),
        nationality = :nationality
      WHERE passenger_id = :id
    `;
    
    const binds = {
      id,
      first_name: passengerData.first_name,
      last_name: passengerData.last_name,
      email: passengerData.email,
      phone: passengerData.phone,
      passport_number: passengerData.passport_number,
      date_of_birth: passengerData.date_of_birth,
      nationality: passengerData.nationality,
    };
    
    await db.execute(sql, binds, { autoCommit: true });
    return await this.findById(id);
  },

  /**
   * Delete passenger
   */
  async delete(id) {
    const sql = `DELETE FROM PASSENGERS WHERE passenger_id = :id`;
    const result = await db.execute(sql, [id], { autoCommit: true });
    return result.rowsAffected > 0;
  },
};

export default PassengerModel;
