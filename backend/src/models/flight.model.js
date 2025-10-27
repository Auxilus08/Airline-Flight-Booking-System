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
          FROM ticket t 
          WHERE t.flight_id = f.flight_id 
            AND t.status != 'CANCELLED'
        )) AS available_seats
      FROM flight f
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
      FROM flight f
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
        f.status,
        f.base_price,
        ao.airport_code AS origin_code,
        ao.city AS origin_city,
        ad.airport_code AS destination_code,
        ad.city AS destination_city,
        r.duration_minutes,
        a.aircraft_model,
        (a.total_seats - (
          SELECT COUNT(*) 
          FROM ticket t 
          WHERE t.flight_id = f.flight_id 
            AND t.status != 'CANCELLED'
        )) AS available_seats
      FROM flight f
      JOIN route r ON f.route_id = r.route_id
      JOIN airport ao ON r.origin_airport_id = ao.airport_id
      JOIN airport ad ON r.destination_airport_id = ad.airport_id
      JOIN aircraft a ON f.aircraft_id = a.aircraft_id
      WHERE UPPER(ao.city) = UPPER(:origin)
        AND UPPER(ad.city) = UPPER(:destination)
        AND f.status = 'SCHEDULED'
    `;
    
    const binds = [origin, destination];
    
    if (departureDate) {
      sql += ` AND TRUNC(f.departure_time) = TO_DATE(:departureDate, 'YYYY-MM-DD')`;
      binds.push(departureDate);
    }
    
    sql += ` ORDER BY f.departure_time`;
    
    return await db.query(sql, binds);
  },
};

export default FlightModel;
