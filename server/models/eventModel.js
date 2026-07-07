const pool = require('../config/db');

const createEvent = async (organizerId, title, description, location, dateTime, capacity, price) => {
  const result = await pool.query(
    `INSERT INTO events (organizer_id, title, description, location, date_time, capacity, price)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [organizerId, title, description, location, dateTime, capacity, price]
  );
  return result.rows[0];
};

const getAllEvents = async () => {
  const result = await pool.query(
    `SELECT * FROM events WHERE status = 'active' ORDER BY date_time ASC`
  );
  return result.rows;
};

const getEventById = async (id) => {
  const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = { createEvent, getAllEvents, getEventById };