const express = require('express');
const router = express.Router();
const { 
  getPlanners, createPlanner, deletePlanner, 
  getBankSettings, updateBankSettings 
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Bank settings (read is accessible; write is ADMIN only)
router.get('/bank-settings', getBankSettings);
router.put('/bank-settings', verifyToken, authorizeRoles('ADMIN'), updateBankSettings);

// Planners management (ADMIN only)
router.get('/planners', verifyToken, authorizeRoles('ADMIN'), getPlanners);
router.post('/planners', verifyToken, authorizeRoles('ADMIN'), createPlanner);
router.delete('/planners/:id', verifyToken, authorizeRoles('ADMIN'), deletePlanner);

module.exports = router;
