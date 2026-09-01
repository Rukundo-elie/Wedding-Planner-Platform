const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  getAllVendors,
  getVendorCategories,
  getVendorById,
  getMyVendorProfile,
  updateMyVendorProfile,
  createVendor,
  updateVendor,
  approveVendor,
  rejectVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Optional auth middleware to check if requester is Admin (enables viewing pending vendors)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wedding_planner_secret_key_12345');
      req.user = decoded;
    } catch (e) {
      // continue without user if token is invalid
    }
  }
  next();
};

router.get('/', optionalAuth, getAllVendors);
router.get('/categories', getVendorCategories);
router.get('/profile/me', verifyToken, authorizeRoles('VENDOR', 'ADMIN'), getMyVendorProfile);
router.put('/profile/me', verifyToken, authorizeRoles('VENDOR', 'ADMIN'), updateMyVendorProfile);
router.get('/:id', getVendorById);
router.post('/', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), createVendor);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), updateVendor);
router.patch('/:id/approve', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), approveVendor);
router.patch('/:id/reject', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), rejectVendor);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN', 'PLANNER'), deleteVendor);

module.exports = router;
