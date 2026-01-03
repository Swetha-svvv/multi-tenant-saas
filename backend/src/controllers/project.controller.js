const db = require('../config/db');

const createProject = async (req, res, next) => {
  try {
    const { name, description, status = 'active' } = req.body;
    const { tenantId, userId } = req.user;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Check project limit
    const tenantResult = await db.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    const maxProjects = tenantResult.rows[0].max_projects;

    const projectCount = await db.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    if (Number(projectCount.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached'
      });
    }

    // Create project
    const result = await db.query(
      `
      INSERT INTO projects (tenant_id, name, description, status, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id, name, description, status, created_by, created_at
      `,
      [tenantId, name, description, status, userId]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        createdBy: result.rows[0].created_by,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    next(error);
  }
};
const listProjects = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const { tenantId } = req.user;

    const offset = (page - 1) * limit;
    const filters = ['p.tenant_id = $1'];
    const values = [tenantId];
    let idx = 2;

    if (status) {
      filters.push(`p.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (search) {
      filters.push(`p.name ILIKE $${idx}`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = filters.join(' AND ');

    const projectsResult = await db.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.id AS creator_id,
        u.full_name AS creator_name,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_task_count
      FROM projects p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE ${whereClause}
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM projects p WHERE ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        projects: projectsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: {
            id: p.creator_id,
            fullName: p.creator_name
          },
          taskCount: Number(p.task_count),
          completedTaskCount: Number(p.completed_task_count),
          createdAt: p.created_at
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
//
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { tenantId } = req.user;

    const result = await db.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.id AS creator_id,
        u.full_name AS creator_name
      FROM projects p
      JOIN users u ON u.id = p.created_by
      WHERE p.id = $1 AND p.tenant_id = $2
      `,
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const p = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdBy: {
          id: p.creator_id,
          fullName: p.creator_name
        },
        createdAt: p.created_at
      }
    });

  } catch (error) {
    next(error);
  }
};

//
const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, userId, role } = req.user;

    // Get project
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
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

    // Authorization
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to update this project'
      });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }

    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }

    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await db.query(
      `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, description, status, updated_at
      `,
      [...values, projectId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    // Get project
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
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

    // Authorization
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to delete this project'
      });
    }

    // Delete project (tasks will be deleted via CASCADE)
    await db.query(
      'DELETE FROM projects WHERE id = $1',
      [projectId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  listProjects,
  getProjectById, 
  updateProject,
  deleteProject

};
