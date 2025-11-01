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
        b.status,
        b.payment_status,
        p.first_name || ' ' || p.last_name AS passenger_name,
        p.email AS passenger_email,
        COUNT(t.ticket_id) AS ticket_count
      FROM BOOKINGS b
      JOIN PASSENGERS p ON b.passenger_id = p.passenger_id
      LEFT JOIN TICKETS t ON b.booking_id = t.booking_id
      GROUP BY b.booking_id, b.booking_date, b.total_amount, 
               b.status, b.payment_status, 
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
        b.status,
        b.payment_status,
        b.created_at,
        p.passenger_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.passport_number
      FROM BOOKINGS b
      JOIN PASSENGERS p ON b.passenger_id = p.passenger_id
      WHERE b.booking_id = :id
    `;
    
  const booking = await db.queryOne(sql, { id });
    
    if (booking) {
      // Get tickets for this booking
      const ticketsSql = `
        SELECT 
          t.ticket_id,
          t.ticket_number,
          t.fare_class,
          t.class_type,
          t.seat_number,
          t.price,
          t.status,
          f.flight_id,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          ao.city AS origin_city,
          ao.code AS origin_code,
          ad.city AS destination_city,
          ad.code AS destination_code
        FROM TICKETS t
        JOIN FLIGHTS f ON t.flight_id = f.flight_id
        JOIN AIRPORTS ao ON f.origin_airport_id = ao.airport_id
        JOIN AIRPORTS ad ON f.destination_airport_id = ad.airport_id
        WHERE t.booking_id = :booking_id
      `;
      
      booking.tickets = await db.query(ticketsSql, { booking_id: id });
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
        b.status,
        b.payment_status,
        COUNT(t.ticket_id) AS ticket_count
      FROM BOOKINGS b
      LEFT JOIN TICKETS t ON b.booking_id = t.booking_id
      WHERE b.passenger_id = :passengerId
      GROUP BY b.booking_id, b.booking_date, b.total_amount, 
               b.status, b.payment_status
      ORDER BY b.booking_date DESC
    `;
    
    return await db.query(sql, { passengerId });
  },

  /**
   * Create new booking with tickets (ACID transaction)
   * Demonstrates ACID properties:
   * - Atomicity: All operations succeed or all fail
   * - Consistency: Maintains database integrity
   * - Isolation: Transaction is isolated from others
   * - Durability: Once committed, changes are permanent
   */
  async create(bookingData) {
    return await db.transaction(async (connection) => {
      try {
        // Step 1: Verify seat availability for all flights
        for (const ticket of bookingData.tickets) {
          const availabilityCheck = `
            SELECT 
              f.available_seats,
              (SELECT COUNT(*) FROM TICKETS t 
               WHERE t.flight_id = :flight_id 
               AND t.status NOT IN ('cancelled', 'CANCELLED')) AS booked_seats
            FROM FLIGHTS f
            WHERE f.flight_id = :flight_id
            FOR UPDATE
          `;
          
          const availability = await connection.execute(
            availabilityCheck,
            { flight_id: ticket.flight_id },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
          );

          const availableSeats = availability.rows[0]?.AVAILABLE_SEATS || 0;
          const bookedSeats = availability.rows[0]?.BOOKED_SEATS || 0;
          
          if (availableSeats - bookedSeats < 1) {
            throw new Error(`Flight ${ticket.flight_id} has no available seats`);
          }

          // Step 2: Check if seat is already booked (if seat_id provided)
          if (ticket.seat_id) {
            const seatCheck = `
              SELECT COUNT(*) as seat_count
              FROM TICKETS
              WHERE flight_id = :flight_id
                AND seat_id = :seat_id
                AND status NOT IN ('cancelled', 'CANCELLED')
            `;
            
            const seatResult = await connection.execute(
              seatCheck,
              { flight_id: ticket.flight_id, seat_id: ticket.seat_id },
              { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
            );

            if (seatResult.rows[0]?.SEAT_COUNT > 0) {
              throw new Error(`Seat already booked on flight ${ticket.flight_id}`);
            }
          }
        }

        // Step 3: Create booking
        const bookingSql = `
          INSERT INTO BOOKINGS (
            user_id,
            passenger_id,
            booking_date,
            status,
            total_amount,
            payment_status,
            created_at
          ) VALUES (
            :user_id,
            :passenger_id,
            SYSDATE,
            :status,
            :total_amount,
            :payment_status,
            SYSTIMESTAMP
          ) RETURNING booking_id INTO :id
        `;
        
        const bookingBinds = {
          user_id: bookingData.user_id || null,
          passenger_id: bookingData.passenger_id,
          total_amount: bookingData.total_amount,
          status: bookingData.status || 'pending',
          payment_status: bookingData.payment_status || 'PENDING',
          id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
        };
        
        const bookingResult = await connection.execute(bookingSql, bookingBinds);
        const bookingId = bookingResult.outBinds.id[0];
        
        // Step 4: Create tickets for each flight
        const ticketIds = [];
        if (bookingData.tickets && bookingData.tickets.length > 0) {
          for (const ticket of bookingData.tickets) {
            const ticketSql = `
              INSERT INTO TICKETS (
                booking_id,
                flight_id,
                seat_id,
                seat_number,
                fare_class,
                class_type,
                price,
                status
              ) VALUES (
                :booking_id,
                :flight_id,
                :seat_id,
                :seat_number,
                :fare_class,
                :class_type,
                :price,
                :status
              ) RETURNING ticket_id INTO :id
            `;
            
            const ticketBinds = {
              booking_id: bookingId,
              flight_id: ticket.flight_id,
              seat_id: ticket.seat_id || null,
              seat_number: ticket.seat_number || null,
              fare_class: ticket.fare_class || 'ECONOMY',
              class_type: ticket.class_type || 'ECONOMY',
              price: ticket.price,
              status: ticket.status || 'confirmed',
              id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
            };

            const ticketResult = await connection.execute(ticketSql, ticketBinds);
            ticketIds.push(ticketResult.outBinds.id[0]);

            // Step 5: Update flight available seats
            const updateSeats = `
              UPDATE FLIGHTS
              SET available_seats = available_seats - 1
              WHERE flight_id = :flight_id
                AND available_seats > 0
            `;
            
            const updateResult = await connection.execute(updateSeats, { flight_id: ticket.flight_id });

            if (updateResult.rowsAffected === 0) {
              throw new Error(`Failed to update seat availability for flight ${ticket.flight_id}`);
            }
          }
        }

        // Transaction will be committed automatically by db.transaction()
        return { bookingId, ticketIds };

      } catch (error) {
        // Transaction will be rolled back automatically by db.transaction()
        throw error;
      }
    });
  },

  /**
   * Update booking status
   */
  async updateStatus(id, status, paymentStatus = null) {
    let sql = `
      UPDATE BOOKINGS SET
        status = :status
    `;
    
    const binds = {
      id,
      status: status,
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
   * Cancel booking (with transaction to restore seats)
   */
  async cancel(id) {
    return await db.transaction(async (connection) => {
      // Get all tickets for this booking
      const getTickets = `
        SELECT ticket_id, flight_id, status
        FROM TICKETS
        WHERE booking_id = :id
      `;
      
      const ticketsResult = await connection.execute(
        getTickets,
        { id },
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      // Update booking status
      await connection.execute(
        `UPDATE BOOKINGS SET status = 'cancelled' WHERE booking_id = :id`,
        { id }
      );
      
      // Update all tickets status and restore available seats
      for (const ticket of ticketsResult.rows) {
        if (ticket.STATUS !== 'cancelled' && ticket.STATUS !== 'CANCELLED') {
          // Cancel ticket
          await connection.execute(
            `UPDATE TICKETS SET status = 'cancelled' WHERE ticket_id = :ticket_id`,
            { ticket_id: ticket.TICKET_ID }
          );

          // Restore seat availability
          await connection.execute(
            `UPDATE FLIGHTS SET available_seats = available_seats + 1 WHERE flight_id = :flight_id`,
            { flight_id: ticket.FLIGHT_ID }
          );
        }
      }
      
      return true;
    });
  },

  /**
   * Get bookings by user ID
   */
  async findByUserId(userId) {
    const sql = `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.total_amount,
        b.status,
        b.payment_status,
        p.first_name || ' ' || p.last_name AS passenger_name,
        p.email AS passenger_email,
        COUNT(t.ticket_id) AS ticket_count
      FROM BOOKINGS b
      JOIN PASSENGERS p ON b.passenger_id = p.passenger_id
      LEFT JOIN TICKETS t ON b.booking_id = t.booking_id
      WHERE b.user_id = :userId
      GROUP BY b.booking_id, b.booking_date, b.total_amount, 
               b.status, b.payment_status, 
               p.first_name, p.last_name, p.email
      ORDER BY b.booking_date DESC
    `;
    
    return await db.query(sql, { userId });
  },
};

export default BookingModel;
