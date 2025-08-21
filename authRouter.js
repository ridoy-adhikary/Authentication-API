const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');

// Auth routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', identifier, authController.signout);

router.patch('/send-verification-code', identifier, authController.sendVerificationCode);
router.patch('/verify-verification-code', identifier, authController.verifyVerificationCode);
router.patch('/change-password', identifier, authController.changePassword);

// Forgot password routes - Changed to POST
router.post('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.post('/verify-forgot-password-code', authController.verifyForgotPasswordCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;