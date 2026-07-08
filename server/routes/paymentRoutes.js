const express = require('express');
const router = express.Router();
const { processPayment, getAllPayments } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, processPayment);
router.get('/', verifyToken, getAllPayments);

module.exports = router;
