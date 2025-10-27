/**
 * Payment Model
 * Database queries for payment operations
 */

import db from '../config/db.js';

const PaymentModel = {
  /**
   * Create new payment
   */
  async create(paymentData) {
    const sql = `
      INSERT INTO PAYMENTS (
        booking_id,
        amount,
        method,
        payment_method,
        status,
        transaction_id,
        transaction_reference
      ) VALUES (
        :booking_id,
        :amount,
        :method,
        :payment_method,
        :status,
        :transaction_id,
        :transaction_reference
      ) RETURNING payment_id INTO :id
    `;

    const transactionId = paymentData.transaction_id || `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const binds = {
      booking_id: paymentData.booking_id,
      amount: paymentData.amount,
      method: paymentData.method || paymentData.payment_method,
      payment_method: paymentData.payment_method || paymentData.method,
      status: paymentData.status || 'completed',
      transaction_id: transactionId,
      transaction_reference: paymentData.transaction_reference || transactionId,
      id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
    };

    const result = await db.execute(sql, binds, { autoCommit: true });
    const paymentId = result.outBinds.id[0];
    return await this.findById(paymentId);
  },

  /**
   * Get payment by ID
   */
  async findById(id) {
    const sql = `
      SELECT 
        p.payment_id,
        p.booking_id,
        p.amount,
        p.payment_date,
        p.method,
        p.payment_method,
        p.status,
        p.transaction_id,
        p.transaction_reference
      FROM PAYMENTS p
      WHERE p.payment_id = :id
    `;
    
    return await db.queryOne(sql, [id]);
  },

  /**
   * Get payments by booking ID
   */
  async findByBookingId(bookingId) {
    const sql = `
      SELECT 
        p.payment_id,
        p.booking_id,
        p.amount,
        p.payment_date,
        p.method,
        p.payment_method,
        p.status,
        p.transaction_id,
        p.transaction_reference
      FROM PAYMENTS p
      WHERE p.booking_id = :booking_id
      ORDER BY p.payment_date DESC
    `;
    
    return await db.query(sql, [bookingId]);
  },

  /**
   * Process payment with booking update (transaction)
   */
  async processPayment(paymentData) {
    return await db.transaction(async (connection) => {
      // Verify booking exists and is pending
      const bookingCheck = `
        SELECT booking_id, total_amount, status, payment_status
        FROM BOOKINGS
        WHERE booking_id = :booking_id
        FOR UPDATE
      `;

      const bookingResult = await connection.execute(
        bookingCheck,
        { booking_id: paymentData.booking_id },
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      if (!bookingResult.rows || bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingResult.rows[0];

      if (booking.PAYMENT_STATUS === 'COMPLETED') {
        throw new Error('Booking already paid');
      }

      if (booking.STATUS === 'cancelled') {
        throw new Error('Cannot process payment for cancelled booking');
      }

      // Verify payment amount matches booking total
      if (Math.abs(booking.TOTAL_AMOUNT - paymentData.amount) > 0.01) {
        throw new Error('Payment amount does not match booking total');
      }

      // Create payment record
      const transactionId = paymentData.transaction_id || `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

      const paymentSql = `
        INSERT INTO PAYMENTS (
          booking_id,
          amount,
          method,
          payment_method,
          status,
          transaction_id,
          transaction_reference
        ) VALUES (
          :booking_id,
          :amount,
          :method,
          :payment_method,
          :status,
          :transaction_id,
          :transaction_reference
        ) RETURNING payment_id INTO :id
      `;

      const paymentBinds = {
        booking_id: paymentData.booking_id,
        amount: paymentData.amount,
        method: paymentData.method || paymentData.payment_method,
        payment_method: paymentData.payment_method || paymentData.method,
        status: 'completed',
        transaction_id: transactionId,
        transaction_reference: paymentData.transaction_reference || transactionId,
        id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
      };

      const paymentResult = await connection.execute(paymentSql, paymentBinds);
      const paymentId = paymentResult.outBinds.id[0];

      // Update booking status to confirmed
      const updateBooking = `
        UPDATE BOOKINGS
        SET status = 'confirmed',
            payment_status = 'COMPLETED'
        WHERE booking_id = :booking_id
      `;

      await connection.execute(updateBooking, { booking_id: paymentData.booking_id });

      // Get the created payment
      const getPayment = `
        SELECT 
          payment_id,
          booking_id,
          amount,
          payment_date,
          method,
          payment_method,
          status,
          transaction_id,
          transaction_reference
        FROM PAYMENTS
        WHERE payment_id = :payment_id
      `;

      const finalPayment = await connection.execute(
        getPayment,
        { payment_id: paymentId },
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      return finalPayment.rows[0];
    });
  },

  /**
   * Update payment status
   */
  async updateStatus(id, status) {
    const sql = `
      UPDATE PAYMENTS
      SET status = :status
      WHERE payment_id = :id
    `;

    await db.execute(sql, { id, status }, { autoCommit: true });
    return await this.findById(id);
  },

  /**
   * Process refund
   */
  async refund(paymentId) {
    return await db.transaction(async (connection) => {
      // Get payment details
      const getPayment = `
        SELECT payment_id, booking_id, amount, status
        FROM PAYMENTS
        WHERE payment_id = :payment_id
        FOR UPDATE
      `;

      const paymentResult = await connection.execute(
        getPayment,
        { payment_id: paymentId },
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      if (!paymentResult.rows || paymentResult.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = paymentResult.rows[0];

      if (payment.STATUS === 'REFUNDED') {
        throw new Error('Payment already refunded');
      }

      // Update payment status
      await connection.execute(
        `UPDATE PAYMENTS SET status = 'REFUNDED' WHERE payment_id = :payment_id`,
        { payment_id: paymentId }
      );

      // Update booking payment status
      await connection.execute(
        `UPDATE BOOKINGS SET payment_status = 'REFUNDED' WHERE booking_id = :booking_id`,
        { booking_id: payment.BOOKING_ID }
      );

      return true;
    });
  },
};

export default PaymentModel;
