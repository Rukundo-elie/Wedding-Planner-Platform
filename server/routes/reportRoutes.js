const express = require('express');
const router = express.Router();
const { getAdminReports } = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, authorizeRoles('ADMIN'), getAdminReports);

module.exports = router;
