const { createBooking, getBookingsByUser } = require('../models/bookingModel');
const { getEventById } = require('../models/eventModel');

const book = async (req, res) => {
  try {
    const { event_id } = req.body;
    const userId = req.user.id;

    const event = await getEventById(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ error: 'This event is not available for booking' });
    }

    const booking = await createBooking(event_id, userId, event.price);
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { book, getMyBookings };