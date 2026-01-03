const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');

const {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/project.controller');

// Create project
router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  createProject
);

// List projects
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  listProjects
);

// Get project by ID (USED BY "View" BUTTON)
router.get(
  '/:projectId',
  authMiddleware,
  tenantMiddleware,
  getProjectById
);

// Update project
router.put(
  '/:projectId',
  authMiddleware,
  tenantMiddleware,
  updateProject
);

// Delete project
router.delete(
  '/:projectId',
  authMiddleware,
  tenantMiddleware,
  deleteProject
);

module.exports = router;
