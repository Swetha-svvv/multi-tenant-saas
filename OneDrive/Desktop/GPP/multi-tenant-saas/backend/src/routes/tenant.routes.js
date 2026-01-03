const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const tenantController = require('../controllers/tenant.controller');

// Get tenant details
router.get('/:tenantId', authMiddleware, tenantMiddleware, tenantController.getTenantDetails);

const roleMiddleware = require('../middleware/role.middleware');

router.get(
  '/',
  authMiddleware,
  roleMiddleware('super_admin'),
  tenantController.listTenants
);

// Update tenant
router.put(
  '/:tenantId',
  authMiddleware,
  roleMiddleware('tenant_admin', 'super_admin'),
  tenantController.updateTenant
);

router.post(
  '/:tenantId/users',
  authMiddleware,
  roleMiddleware('tenant_admin'),
  tenantController.addUser
);

router.get(
  '/:tenantId/users',
  authMiddleware,
  tenantMiddleware,
  tenantController.listUsers
);


module.exports = router;
