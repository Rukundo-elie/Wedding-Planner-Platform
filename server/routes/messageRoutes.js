const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesBetweenUsers, getChatPartners } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, sendMessage);
router.get('/history/:otherUserId', verifyToken, getMessagesBetweenUsers);
router.get('/partners', verifyToken, getChatPartners);

module.exports = router;
