const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingImage,
} = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getAllBookings);
router.get('/:id', verifyToken, getBookingById);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), updateBookingStatus);
router.put('/:id/image', verifyToken, updateBookingImage);

module.exports = router;
