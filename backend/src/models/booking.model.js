/**
 * Booking Model
 * Database queries for booking operations
 */

import db from '../config/db.js';

const BookingModel = {
  /**
   * Get all bookings
   */
  async findAll() {
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        p.first_name || ' ' || p.last_name AS passenger_name,
        p.email AS passenger_email,
        COUNT(t.ticket_id) AS ticket_count
      FROM booking b
      JOIN passenger p ON b.passenger_id = p.passenger_id
      LEFT JOIN ticket t ON b.booking_id = t.booking_id
      GROUP BY b.booking_id, b.booking_date, b.total_amount, 
               b.booking_status, b.payment_status, 
               p.first_name, p.last_name, p.email
      ORDER BY b.booking_date DESC
    `;
    
    return await db.query(sql);
  },

  /**
   * Get booking by ID with full details
   */
  async findById(id) {
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        b.created_at,
        p.passenger_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.passport_number
      FROM booking b
      JOIN passenger p ON b.passenger_id = p.passenger_id
      WHERE b.booking_id = :id
    `;
    
    const booking = await db.queryOne(sql, [id]);
    
    if (booking) {
      // Get tickets for this booking
      const ticketsSql = `
        SELECT 
          t.ticket_id,
          t.ticket_number,
          t.class_type,
          t.price,
          t.status,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          ao.city AS origin_city,
          ad.city AS destination_city,
          s.seat_number
        FROM ticket t
        JOIN flight f ON t.flight_id = f.flight_id
        JOIN route r ON f.route_id = r.route_id
        JOIN airport ao ON r.origin_airport_id = ao.airport_id
        JOIN airport ad ON r.destination_airport_id = ad.airport_id
        LEFT JOIN seat s ON t.seat_id = s.seat_id
        WHERE t.booking_id = :booking_id
      `;
      
      booking.tickets = await db.query(ticketsSql, [id]);
    }
    
    return booking;
  },

  /**
   * Get bookings by passenger ID
   */
  async findByPassengerId(passengerId) {
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        COUNT(t.ticket_id) AS ticket_count
      FROM booking b
      LEFT JOIN ticket t ON b.booking_id = t.booking_id
      WHERE b.passenger_id = :passengerId
      GROUP BY b.booking_id, b.booking_date, b.total_amount, 
               b.booking_status, b.payment_status
      ORDER BY b.booking_date DESC
    `;
    
    return await db.query(sql, [passengerId]);
  },

  /**
   * Create new booking with tickets (transaction)
   */
  async create(bookingData) {
    return await db.transaction(async (connection) => {
      // Create booking
      const bookingSql = `
        INSERT INTO booking (
          booking_id,
          passenger_id,
          total_amount,
          booking_status,
          payment_status
        ) VALUES (
          booking_seq.NEXTVAL,
          :passenger_id,
          :total_amount,
          :booking_status,
          :payment_status
        ) RETURNING booking_id INTO :id
      `;
      
      const bookingBinds = {
        passenger_id: bookingData.passenger_id,
        total_amount: bookingData.total_amount,
        booking_status: bookingData.booking_status || 'PENDING',
        payment_status: bookingData.payment_status || 'PENDING',
        id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      };
      
      const bookingResult = await connection.execute(bookingSql, bookingBinds);
      const bookingId = bookingResult.outBinds.id[0];
      
      // Create tickets if provided
      if (bookingData.tickets && bookingData.tickets.length > 0) {
        for (const ticket of bookingData.tickets) {
          const ticketSql = `
            INSERT INTO ticket (
              ticket_id,
              booking_id,
              flight_id,
              seat_id,
              class_type,
              price,
              status
            ) VALUES (
              ticket_seq.NEXTVAL,
              :booking_id,
              :flight_id,
              :seat_id,
              :class_type,
              :price,
              :status
            )
          `;
          
          await connection.execute(ticketSql, {
            booking_id: bookingId,
            flight_id: ticket.flight_id,
            seat_id: ticket.seat_id,
            class_type: ticket.class_type,
            price: ticket.price,
            status: ticket.status || 'BOOKED',
          });
        }
      }
      
      return bookingId;
    });
  },

  /**
   * Update booking status
   */
  async updateStatus(id, status, paymentStatus = null) {
    let sql = `
      UPDATE booking SET
        booking_status = :booking_status
    `;
    
    const binds = {
      id,
      booking_status: status,
    };
    
    if (paymentStatus) {
      sql += `, payment_status = :payment_status`;
      binds.payment_status = paymentStatus;
    }
    
    sql += ` WHERE booking_id = :id`;
    
    await db.execute(sql, binds, { autoCommit: true });
    return await this.findById(id);
  },

  /**
   * Cancel booking
   */
  async cancel(id) {
    return await db.transaction(async (connection) => {
      // Update booking status
      await connection.execute(
        `UPDATE booking SET booking_status = 'CANCELLED' WHERE booking_id = :id`,
        [id]
      );
      
      // Update all tickets status
      await connection.execute(
        `UPDATE ticket SET status = 'CANCELLED' WHERE booking_id = :id`,
        [id]
      );
      
      return true;
    });
  },
};

export default BookingModel;
