const express = require('express');
const router = express.Router();
const {
  getNotificationSummary,
  markChatAsRead,
  markContactAsRead,
} = require('../controllers/notificationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/summary', verifyToken, getNotificationSummary);
router.patch('/chat/read/:partnerId', verifyToken, markChatAsRead);
router.patch('/contact/read/:id', verifyToken, authorizeRoles('ADMIN'), markContactAsRead);

module.exports = router;
