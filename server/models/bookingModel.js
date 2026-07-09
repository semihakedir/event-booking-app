const pool = require('../config/db');

const createBooking = async (eventId, userId, amountPaid) => {
  const result = await pool.query(
    `INSERT INTO bookings (event_id, user_id, amount_paid)
     VALUES ($1, $2, $3) RETURNING *`,
    [eventId, userId, amountPaid]
  );
  return result.rows[0];
};

const getBookingsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT b.*, e.title, e.date_time, e.location
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = $1`,
    [userId]
  );
  return result.rows;
};

const countBookingsForEvent = async (eventId) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM bookings WHERE event_id = $1 AND status = 'confirmed'`,
    [eventId]
  );
  return parseInt(result.rows[0].count);
};

module.exports = { createBooking, getBookingsByUser, countBookingsForEvent };