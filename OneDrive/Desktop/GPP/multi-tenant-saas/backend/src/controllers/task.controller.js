const db = require('../config/db');

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
    const { tenantId } = req.user;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Get project and tenant_id from project
    const projectResult = await db.query(
      'SELECT id, tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    // Tenant isolation
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const userResult = await db.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to this tenant'
        });
      }
    }

    // Create task
    const result = await db.query(
      `
      INSERT INTO tasks (project_id, tenant_id, title, description, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at
      `,
      [
        projectId,
        project.tenant_id,
        title,
        description,
        priority,
        assignedTo || null,
        dueDate || null
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        projectId: result.rows[0].project_id,
        tenantId: result.rows[0].tenant_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assignedTo: result.rows[0].assigned_to,
        dueDate: result.rows[0].due_date,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    next(error);
  }
};
const listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      status,
      assignedTo,
      priority,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const { tenantId } = req.user;
    const offset = (page - 1) * limit;

    // Verify project belongs to tenant
    const projectResult = await db.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (projectResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const filters = ['t.project_id = $1'];
    const values = [projectId];
    let idx = 2;

    if (status) {
      filters.push(`t.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (assignedTo) {
      filters.push(`t.assigned_to = $${idx}`);
      values.push(assignedTo);
      idx++;
    }

    if (priority) {
      filters.push(`t.priority = $${idx}`);
      values.push(priority);
      idx++;
    }

    if (search) {
      filters.push(`t.title ILIKE $${idx}`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = filters.join(' AND ');

    const tasksResult = await db.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        u.id AS assigned_user_id,
        u.full_name AS assigned_user_name,
        u.email AS assigned_user_email
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE ${whereClause}
      ORDER BY 
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        t.due_date ASC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        tasks: tasksResult.rows.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          assignedTo: t.assigned_user_id
            ? {
                id: t.assigned_user_id,
                fullName: t.assigned_user_name,
                email: t.assigned_user_email
              }
            : null,
          createdAt: t.created_at
        })),
        total,
        pagination: {
          currentPage: Number(page),
          totalPages,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const allowedStatuses = ['todo', 'in_progress', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Verify task belongs to tenant
    const taskResult = await db.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const result = await db.query(
      `
      UPDATE tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at
      `,
      [status, taskId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    next(error);
  }
};
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate
    } = req.body;

    const { tenantId } = req.user;

    // Verify task belongs to tenant
    const taskResult = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate status
    if (status) {
      const allowedStatuses = ['todo', 'in_progress', 'completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
    }

    // Validate priority
    if (priority) {
      const allowedPriorities = ['low', 'medium', 'high'];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority'
        });
      }
    }

    // Validate assigned user
    if (assignedTo !== undefined && assignedTo !== null) {
      const userResult = await db.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to this tenant'
        });
      }
    }

    const updatedTask = await db.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = $5,
        due_date = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        title || null,
        description || null,
        status || null,
        priority || null,
        assignedTo ?? null,
        dueDate ?? null,
        taskId
      ]
    );

    const t = updatedTask.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assigned_to,
        dueDate: t.due_date,
        updatedAt: t.updated_at
      }
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask
};


