const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', verifyToken, authorizeRoles('ADMIN'), createPackage);
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updatePackage);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deletePackage);

module.exports = router;
