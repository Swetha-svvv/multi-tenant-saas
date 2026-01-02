const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const userController = require('../controllers/user.controller');

// ✅ LIST USERS (tenant_admin only)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('tenant_admin'),
  userController.listUsers
);

// Update user
router.put(
  '/:userId',
  authMiddleware,
  userController.updateUser
);

// Delete user
router.delete(
  '/:userId',
  authMiddleware,
  roleMiddleware('tenant_admin'),
  userController.deleteUser
);

module.exports = router;
