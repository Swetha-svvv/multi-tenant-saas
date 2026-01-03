const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

// Login
router.post('/login', authController.login);

const authMiddleware = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, authController.getCurrentUser);

router.post('/register-tenant', authController.registerTenant);

router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
