const express = require('express');
const router = express.Router();
const { 
  processPayment, 
  verifyFlutterwavePayment, 
  getAllPayments, 
  verifyPayment, 
  rejectPayment 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, processPayment);
router.post('/verify-flutterwave', verifyToken, verifyFlutterwavePayment);
router.get('/', verifyToken, getAllPayments);
router.patch('/:id/verify', verifyToken, verifyPayment);
router.patch('/:id/reject', verifyToken, rejectPayment);

module.exports = router;
