const express = require('express');
const router = express.Router();
const { processPayment, getAllPayments, verifyPayment, rejectPayment } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, processPayment);
router.get('/', verifyToken, getAllPayments);
router.patch('/:id/verify', verifyToken, verifyPayment);
router.patch('/:id/reject', verifyToken, rejectPayment);

module.exports = router;
