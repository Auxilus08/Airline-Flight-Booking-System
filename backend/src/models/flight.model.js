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
        f.airline_id,
        f.flight_number,
        f.route_id,
        f.aircraft_id,
        f.origin_airport_id,
        f.destination_airport_id,
        f.departure_time,
        f.arrival_time,
        f.duration_minutes,
        f.price,
        f.available_seats,
        f.status,
        f.created_at,
        ao.code AS origin_code,
        ao.city AS origin_city,
        ao.country AS origin_country,
        ad.code AS destination_code,
        ad.city AS destination_city,
        ad.country AS destination_country,
        r.distance_km,
        r.duration_minutes AS route_duration,
        a.aircraft_model,
        a.total_seats
      FROM FLIGHTS f
      LEFT JOIN ROUTE r ON f.route_id = r.route_id
      JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
      JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id
      LEFT JOIN AIRCRAFT a ON f.aircraft_id = a.aircraft_id
      WHERE 1=1
    `;

    const binds = {};

    if (filters.origin) {
      sql += ` AND UPPER(ao.city) LIKE UPPER(:origin)`;
      binds.origin = `%${filters.origin}%`;
    }

    if (filters.destination) {
      sql += ` AND UPPER(ad.city) LIKE UPPER(:destination)`;
      binds.destination = `%${filters.destination}%`;
    }

    if (filters.status) {
      sql += ` AND UPPER(f.status) = UPPER(:status)`;
      binds.status = filters.status;
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
        f.airline_id,
        f.flight_number,
        f.route_id,
        f.aircraft_id,
        f.origin_airport_id,
        f.destination_airport_id,
        f.departure_time,
        f.arrival_time,
        f.duration_minutes,
        f.price,
        f.available_seats,
        f.status,
        f.created_at,
        ao.code AS origin_code,
        ao.name AS origin_airport,
        ao.city AS origin_city,
        ao.country AS origin_country,
        ad.code AS destination_code,
        ad.name AS destination_airport,
        ad.city AS destination_city,
        ad.country AS destination_country,
        r.distance_km,
        r.duration_minutes AS route_duration,
        a.aircraft_model,
        a.total_seats
      FROM FLIGHTS f
      LEFT JOIN ROUTE r ON f.route_id = r.route_id
      JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
      JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id
      LEFT JOIN AIRCRAFT a ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = :id
    `;

    return await db.queryOne(sql, { id });
  },

  /**
   * Search flights by origin and destination
   */
  async search(origin, destination, departureDate = null) {
    let sql = `
      SELECT 
        f.flight_id,
        f.airline_id,
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        f.duration_minutes,
        f.price,
        f.status,
        a.name AS airline_name,
        a.airline_id,
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
      WHERE UPPER(ao.code) = UPPER(:origin)
        AND UPPER(ad.code) = UPPER(:destination)
        AND UPPER(f.status) = 'SCHEDULED'
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
        status,
        created_at
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
        :status,
        :created_at
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
      available_seats: flightData.available_seats ?? flightData.available_seats === 0 ? 0 : null,
      status: flightData.status || 'SCHEDULED',
      created_at: flightData.created_at || { val: new Date(), dir: db.oracledb.BIND_IN },
      id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    };

    // If available_seats wasn't provided, omit it to let DB or other logic set it later
    if (binds.available_seats === null) {
      delete binds.available_seats;
      // remove from SQL as well — simplest approach: let caller provide available_seats; DB should have a trigger/default
    }

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

    const pushField = (clause, key, value) => {
      fields.push(clause);
      binds[key] = value;
    };

    if (flightData.airline_id !== undefined) pushField('airline_id = :airline_id', 'airline_id', flightData.airline_id);
    if (flightData.flight_number !== undefined) pushField('flight_number = :flight_number', 'flight_number', flightData.flight_number);
    if (flightData.route_id !== undefined) pushField('route_id = :route_id', 'route_id', flightData.route_id);
    if (flightData.aircraft_id !== undefined) pushField('aircraft_id = :aircraft_id', 'aircraft_id', flightData.aircraft_id);
    if (flightData.origin_airport_id !== undefined) pushField('origin_airport_id = :origin_airport_id', 'origin_airport_id', flightData.origin_airport_id);
    if (flightData.destination_airport_id !== undefined) pushField('destination_airport_id = :destination_airport_id', 'destination_airport_id', flightData.destination_airport_id);
    if (flightData.departure_time !== undefined) pushField("departure_time = TO_TIMESTAMP(:departure_time, 'YYYY-MM-DD HH24:MI:SS')", 'departure_time', flightData.departure_time);
    if (flightData.arrival_time !== undefined) pushField("arrival_time = TO_TIMESTAMP(:arrival_time, 'YYYY-MM-DD HH24:MI:SS')", 'arrival_time', flightData.arrival_time);
    if (flightData.duration_minutes !== undefined) pushField('duration_minutes = :duration_minutes', 'duration_minutes', flightData.duration_minutes);
    if (flightData.price !== undefined) pushField('price = :price', 'price', flightData.price);
    if (flightData.available_seats !== undefined) pushField('available_seats = :available_seats', 'available_seats', flightData.available_seats);
    if (flightData.status !== undefined) pushField('status = :status', 'status', flightData.status);

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
    const result = await db.execute(sql, { id }, { autoCommit: true });
    return result.rowsAffected > 0;
  },

  /**
   * Check seat availability
   */
  async checkAvailability(flightId, seatsNeeded = 1) {
    // Prefer authoritative available_seats column on FLIGHTS; fallback to computing from tickets
    let sql = `SELECT f.available_seats FROM FLIGHTS f WHERE f.flight_id = :flight_id`;
    const result = await db.queryOne(sql, { flight_id: flightId });

    if (result && result.AVAILABLE_SEATS !== undefined && result.AVAILABLE_SEATS !== null) {
      return result.AVAILABLE_SEATS >= seatsNeeded;
    }

    // Fallback: compute from tickets and aircraft total
    sql = `
      SELECT 
        a.total_seats,
        (a.total_seats - (
          SELECT COUNT(*) 
          FROM TICKETS t 
          WHERE t.flight_id = :flight_id 
            AND UPPER(t.status) != 'CANCELLED'
        )) AS available_seats
      FROM FLIGHTS f
      LEFT JOIN AIRCRAFT a ON f.aircraft_id = a.aircraft_id
      WHERE f.flight_id = :flight_id
    `;

    const computed = await db.queryOne(sql, { flight_id: flightId });
    return computed && computed.AVAILABLE_SEATS >= seatsNeeded;
  },
};

export default FlightModel;
