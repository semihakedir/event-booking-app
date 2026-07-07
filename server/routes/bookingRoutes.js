const express = require('express');
const router = express.Router();
const { book, getMyBookings } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, book);
router.get('/my-bookings', verifyToken, getMyBookings);

module.exports = router;