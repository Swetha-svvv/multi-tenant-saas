const db = require('../config/db');

const getTenantDetails = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;

    // Tenant users can access only their own tenant
    if (user.role !== 'super_admin' && user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to tenant'
      });
    }

    // Get tenant
    const tenantResult = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = tenantResult.rows[0];

    // Stats
    const usersCount = await db.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    const projectsCount = await db.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const tasksCount = await db.query(
      'SELECT COUNT(*) FROM tasks WHERE tenant_id = $1',
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
const updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;
    const {
      name,
      status,
      subscriptionPlan,
      maxUsers,
      maxProjects
    } = req.body;

    // Tenant admin restrictions
    if (user.role === 'tenant_admin') {
      if (user.tenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      if (status || subscriptionPlan || maxUsers || maxProjects) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin cannot update these fields'
        });
      }
    }

    // Build dynamic update
    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    if (user.role === 'super_admin') {
      if (status) {
        fields.push(`status = $${index++}`);
        values.push(status);
      }
      if (subscriptionPlan) {
        fields.push(`subscription_plan = $${index++}`);
        values.push(subscriptionPlan);
      }
      if (maxUsers) {
        fields.push(`max_users = $${index++}`);
        values.push(maxUsers);
      }
      if (maxProjects) {
        fields.push(`max_projects = $${index++}`);
        values.push(maxProjects);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const query = `
      UPDATE tenants
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, name, updated_at
    `;
    values.push(tenantId);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};
const listTenants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const { status, subscriptionPlan } = req.query;

    const filters = [];
    const values = [];
    let idx = 1;

    if (status) {
      filters.push(`t.status = $${idx++}`);
      values.push(status);
    }

    if (subscriptionPlan) {
      filters.push(`t.subscription_plan = $${idx++}`);
      values.push(subscriptionPlan);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Get tenants
    const tenantsResult = await db.query(
      `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.created_at,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    // Count total
    const countResult = await db.query(
      `
      SELECT COUNT(*) FROM tenants t
      ${whereClause}
      `,
      values
    );

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsResult.rows.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: Number(t.total_users),
          totalProjects: Number(t.total_projects),
          createdAt: t.created_at
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const bcrypt = require('bcrypt');

const addUser = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { email, password, fullName, role = 'user' } = req.body;
    const currentUser = req.user;

    // Tenant admin can add users only to their tenant
    if (currentUser.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and fullName are required'
      });
    }

    // Check tenant user limit
    const tenantResult = await db.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    const maxUsers = tenantResult.rows[0].max_users;

    const userCountResult = await db.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    if (Number(userCountResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'Subscription user limit reached'
      });
    }

    // Check email uniqueness per tenant
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenantId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, is_active, created_at
      `,
      [tenantId, email, passwordHash, fullName, role]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        tenantId,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    next(error);
  }
};
const listUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { search, role, page = 1, limit = 50 } = req.query;
    const user = req.user;

    // Tenant isolation
    if (user.role !== 'super_admin' && user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const offset = (page - 1) * limit;
    const filters = ['tenant_id = $1'];
    const values = [tenantId];
    let idx = 2;

    if (search) {
      filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (role) {
      filters.push(`role = $${idx}`);
      values.push(role);
      idx++;
    }

    const whereClause = filters.join(' AND ');

    const usersResult = await db.query(
      `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
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

module.exports = {
  getTenantDetails,
  updateTenant,
  listTenants,
  addUser,
  listUsers
};



