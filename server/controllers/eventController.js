const { createEvent, getAllEvents, getEventById, getEventsByOrganizer, cancelEvent, getAllEventsAdmin, updateEvent } = require('../models/eventModel');
const{ countBookingsForEvent, refundBookingsForEvent } = require('../models/bookingModel');
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

const getMyEvents = async (req, res) => {
  try {
    const events = await getEventsByOrganizer(req.user.id);
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const bookedCount = await countBookingsForEvent(event.id);
        return { ...event, bookedCount };
      })
    );
    res.json(eventsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancel = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own events' });
    }

    const { reason } = req.body || {};
    const cancelled = await cancelEvent(req.params.id, reason || null);
    await refundBookingsForEvent(req.params.id);

    res.json({ message: 'Event cancelled', event: cancelled });
 } catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
};

const getAllForAdmin = async (req, res) => {
  try {
    const events = await getAllEventsAdmin();
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const bookedCount = await countBookingsForEvent(event.id);
        return { ...event, bookedCount };
      })
    );
    res.json(eventsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const update = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    const { title, description, location, date_time, capacity, price } = req.body;
    const updated = await updateEvent(req.params.id, title, description, location, date_time, capacity, price);
    res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { create, getAll, getOne, getMyEvents, cancel, getAllForAdmin, update };

