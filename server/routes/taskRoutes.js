const express = require('express');
const router = express.Router();
const { getTasksByBooking, createTask, updateTask } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/booking/:bookingId', verifyToken, getTasksByBooking);
router.post('/booking/:bookingId', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);

module.exports = router;
