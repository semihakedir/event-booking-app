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
    `SELECT * FROM events WHERE status = 'active' AND date_time > NOW() ORDER BY date_time ASC`
  );
  return result.rows;
};

const getEventById = async (id) => {
  const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return result.rows[0];
};
const getEventsByOrganizer = async (organizerId) => {
  const result = await pool.query(
    'SELECT * FROM events WHERE organizer_id = $1 ORDER BY date_time ASC',
    [organizerId]
  );
  return result.rows;
};

const cancelEvent = async (id, reason) => {
  const result = await pool.query(
    `UPDATE events SET status = 'cancelled', cancellation_reason = $2 WHERE id = $1 RETURNING *`,
    [id, reason]
  );
  return result.rows[0];
};

const getAllEventsAdmin = async () => {
  const result = await pool.query(
    `SELECT events.*, users.name AS organizer_name, users.email AS organizer_email
     FROM events
     JOIN users ON events.organizer_id = users.id
     ORDER BY events.date_time ASC`
  );
  return result.rows;
};
const updateEvent = async (id, title, description, location, dateTime, capacity, price) => {
  const result = await pool.query(
    `UPDATE events SET title = $1, description = $2, location = $3, date_time = $4, capacity = $5, price = $6
     WHERE id = $7 RETURNING *`,
    [title, description, location, dateTime, capacity, price, id]
  );
  return result.rows[0];
};
module.exports = { createEvent, getAllEvents, getEventById, getEventsByOrganizer, cancelEvent, getAllEventsAdmin, updateEvent };
