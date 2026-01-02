const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const taskController = require('../controllers/task.controller');

// Create task
router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantMiddleware,
  taskController.createTask
);
// List project tasks
router.get(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantMiddleware,
  taskController.listProjectTasks
);
// Update task status
router.patch(
  '/tasks/:taskId/status',
  authMiddleware,
  tenantMiddleware,
  taskController.updateTaskStatus
);
// Update task (full)
router.put(
  '/tasks/:taskId',
  authMiddleware,
  tenantMiddleware,
  taskController.updateTask
);

module.exports = router;
