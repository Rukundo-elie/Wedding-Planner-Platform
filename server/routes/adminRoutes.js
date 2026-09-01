const express = require('express');
const router = express.Router();
const { getPlanners, createPlanner, deletePlanner } = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('ADMIN'));

router.get('/planners', getPlanners);
router.post('/planners', createPlanner);
router.delete('/planners/:id', deletePlanner);

module.exports = router;
