const express = require('express');
const router = express.Router();
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.post('/', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), createVendor);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), updateVendor);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), deleteVendor);

module.exports = router;
