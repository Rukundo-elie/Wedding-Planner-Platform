const express = require('express');
const router = express.Router();
const { createContactMessage, getAllContactMessages } = require('../controllers/contactController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', createContactMessage);
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllContactMessages);

module.exports = router;
