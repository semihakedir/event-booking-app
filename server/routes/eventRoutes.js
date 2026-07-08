const express = require('express');
const router = express.Router();
const { create, getAll, getOne, getMyEvents, cancel, getAllForAdmin, update } = require('../controllers/eventController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', getAll);
router.get('/my-events', verifyToken, checkRole('organizer', 'admin'), getMyEvents);
router.get('/admin/all', verifyToken, checkRole('admin'), getAllForAdmin);
router.get('/:id', getOne);
router.post('/', verifyToken, checkRole('organizer', 'admin'), create);
router.patch('/:id/cancel', verifyToken, checkRole('organizer', 'admin'), cancel);
router.put('/:id', verifyToken, checkRole('organizer', 'admin'), update);

module.exports = router;