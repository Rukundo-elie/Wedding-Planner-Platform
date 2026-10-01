const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, googleLogin, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);

module.exports = router;
