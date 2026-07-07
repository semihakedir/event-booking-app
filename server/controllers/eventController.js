const { createEvent, getAllEvents, getEventById } = require('../models/eventModel');

const create = async (req, res) => {
  try {
    const { title, description, location, date_time, capacity, price } = req.body;
    const organizerId = req.user.id;

    const event = await createEvent(organizerId, title, description, location, date_time, capacity, price);
    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { create, getAll, getOne };