/**
 * Flight Model
 * Database queries for flight operations
 */

import db from '../config/db.js';

const FlightModel = {
  /**
   * Get all flights with optional filters
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.status,
        f.base_price,
        ao.airport_code AS origin_code,
        ao.city AS origin_city,
        ao.country AS origin_country,
        ad.airport_code AS destination_code,
        ad.city AS destination_city,
        ad.country AS destination_country,
        r.distance_km,
        r.duration_minutes,
        a.aircraft_model,
        a.total_seats,
        (a.total_seats - (
          SELECT COUNT(*) 
          FROM TICKETS t 
          WHERE t.flight_id = f.flight_id 
            AND t.status != 'CANCELLED'
        )) AS available_seats
      FROM FLIGHTS f
      JOIN route r ON f.route_id = r.route_id
      JOIN airport ao ON r.origin_airport_id = ao.airport_id
      JOIN airport ad ON r.destination_airport_id = ad.airport_id
      JOIN aircraft a ON f.aircraft_id = a.aircraft_id
      WHERE 1=1
    `;
    
    const binds = [];
    
    if (filters.origin) {
      sql += ` AND UPPER(ao.city) LIKE UPPER(:origin)`;
      binds.push(`%${filters.origin}%`);
    }
    
    if (filters.destination) {
      sql += ` AND UPPER(ad.city) LIKE UPPER(:destination)`;
      binds.push(`%${filters.destination}%`);
    }
    
    if (filters.status) {
      sql += ` AND f.status = :status`;
      binds.push(filters.status);
    }
    
    sql += ` ORDER BY f.departure_time`;
    
    return await db.query(sql, binds);
  },

  /**
   * Get flight by ID
   */
  async findById(id) {
    const sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.status,
        f.base_price,
        ao.airport_code AS origin_code,
        ao.airport_name AS origin_airport,
        ao.city AS origin_city,
        ao.country AS origin_country,
        ad.airport_code AS destination_code,
        ad.airport_name AS destination_airport,
        ad.city AS destination_city,
        ad.country AS destination_country,
        r.distance_km,
        r.duration_minutes,
        a.aircraft_model,
        a.registration_number,
        a.total_seats,
        a.economy_seats,
        a.business_seats,
        a.first_class_seats
      FROM FLIGHTS f
      JOIN route r ON f.route_id = r.route_id
      JOIN airport ao ON r.origin_airport_id = ao.airport_id
      JOIN airport ad ON r.destination_airport_id = ad.airport_id
      JOIN aircraft a ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = :id
    `;
    
    return await db.queryOne(sql, [id]);
  },

  /**
   * Search flights by origin and destination
   */
  async search(origin, destination, departureDate = null) {
    let sql = `
      SELECT 
        f.flight_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.duration_minutes,
        f.price,
        f.available_seats,
        f.status,
        a.name AS airline_name,
        a.iata_code AS airline_code,
        ao.code AS origin_code,
        ao.city AS origin_city,
        ao.name AS origin_airport,
        ad.code AS destination_code,
        ad.city AS destination_city,
        ad.name AS destination_airport
      FROM FLIGHTS f
      JOIN AIRLINES a ON f.airline_id = a.airline_id
      JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
      JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id
      WHERE UPPER(ao.city) = UPPER(:origin)
        AND UPPER(ad.city) = UPPER(:destination)
        AND f.status IN ('scheduled', 'SCHEDULED')
        AND f.available_seats > 0
    `;
    
    const binds = { origin, destination };
    
    if (departureDate) {
      sql += ` AND TRUNC(f.departure_time) = TO_DATE(:departureDate, 'YYYY-MM-DD')`;
      binds.departureDate = departureDate;
    }
    
    sql += ` ORDER BY f.departure_time`;
    
    return await db.query(sql, binds);
  },

  /**
   * Create new flight (Admin)
   */
  async create(flightData) {
    const sql = `
      INSERT INTO FLIGHTS (
        airline_id,
        flight_number,
        route_id,
        aircraft_id,
        origin_airport_id,
        destination_airport_id,
        departure_time,
        arrival_time,
        duration_minutes,
        price,
        available_seats,
        status
      ) VALUES (
        :airline_id,
        :flight_number,
        :route_id,
        :aircraft_id,
        :origin_airport_id,
        :destination_airport_id,
        TO_TIMESTAMP(:departure_time, 'YYYY-MM-DD HH24:MI:SS'),
        TO_TIMESTAMP(:arrival_time, 'YYYY-MM-DD HH24:MI:SS'),
        :duration_minutes,
        :price,
        :available_seats,
        :status
      ) RETURNING flight_id INTO :id
    `;

    const binds = {
      airline_id: flightData.airline_id,
      flight_number: flightData.flight_number,
      route_id: flightData.route_id,
      aircraft_id: flightData.aircraft_id,
      origin_airport_id: flightData.origin_airport_id,
      destination_airport_id: flightData.destination_airport_id,
      departure_time: flightData.departure_time,
      arrival_time: flightData.arrival_time,
      duration_minutes: flightData.duration_minutes,
      price: flightData.price,
      available_seats: flightData.available_seats,
      status: flightData.status || 'scheduled',
      id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    };

    const result = await db.execute(sql, binds, { autoCommit: true });
    const flightId = result.outBinds.id[0];
    return await this.findById(flightId);
  },

  /**
   * Update flight (Admin)
   */
  async update(id, flightData) {
    const fields = [];
    const binds = { id };

    if (flightData.flight_number) {
      fields.push('flight_number = :flight_number');
      binds.flight_number = flightData.flight_number;
    }
    if (flightData.departure_time) {
      fields.push("departure_time = TO_TIMESTAMP(:departure_time, 'YYYY-MM-DD HH24:MI:SS')");
      binds.departure_time = flightData.departure_time;
    }
    if (flightData.arrival_time) {
      fields.push("arrival_time = TO_TIMESTAMP(:arrival_time, 'YYYY-MM-DD HH24:MI:SS')");
      binds.arrival_time = flightData.arrival_time;
    }
    if (flightData.price !== undefined) {
      fields.push('price = :price');
      binds.price = flightData.price;
    }
    if (flightData.available_seats !== undefined) {
      fields.push('available_seats = :available_seats');
      binds.available_seats = flightData.available_seats;
    }
    if (flightData.status) {
      fields.push('status = :status');
      binds.status = flightData.status;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const sql = `UPDATE FLIGHTS SET ${fields.join(', ')} WHERE flight_id = :id`;
    await db.execute(sql, binds, { autoCommit: true });
    return await this.findById(id);
  },

  /**
   * Delete flight (Admin)
   */
  async delete(id) {
    const sql = `DELETE FROM FLIGHTS WHERE flight_id = :id`;
    const result = await db.execute(sql, [id], { autoCommit: true });
    return result.rowsAffected > 0;
  },

  /**
   * Check seat availability
   */
  async checkAvailability(flightId, seatsNeeded = 1) {
    const sql = `
      SELECT 
        a.total_seats,
        (a.total_seats - (
          SELECT COUNT(*) 
          FROM TICKETS t 
          WHERE t.flight_id = :flight_id 
            AND t.status NOT IN ('cancelled', 'CANCELLED')
        )) AS available_seats
      FROM FLIGHTS f
      JOIN aircraft a ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = :flight_id
    `;

    const result = await db.queryOne(sql, [flightId]);
    return result && result.AVAILABLE_SEATS >= seatsNeeded;
  },
};

export default FlightModel;
