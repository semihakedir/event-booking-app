const express = require('express');
const router = express.Router();
const { create, getAll, getOne } = require('../controllers/eventController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', verifyToken, checkRole('organizer', 'admin'), create);

module.exports = router;