const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res, next) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user;
    let tenant = null;

    // 🔹 SUPER ADMIN LOGIN (NO TENANT)
    if (email === 'superadmin@system.com') {
      const result = await db.query(
        "SELECT * FROM users WHERE email = $1 AND role = 'super_admin'",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      user = result.rows[0];
    }

    // 🔹 TENANT USER LOGIN
    else {
      if (!tenantSubdomain) {
        return res.status(400).json({
          success: false,
          message: 'tenantSubdomain is required'
        });
      }

      const tenantResult = await db.query(
        'SELECT * FROM tenants WHERE subdomain = $1',
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      tenant = tenantResult.rows[0];

      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1 AND tenant_id = $2',
        [email, tenant.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      user = userResult.rows[0];
    }

    // 🔐 Password check
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 🔑 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subdomain,
        t.subscription_plan,
        t.max_users,
        t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: user.tenant_id
          ? {
              id: user.tenant_id,
              name: user.tenant_name,
              subdomain: user.subdomain,
              subscriptionPlan: user.subscription_plan,
              maxUsers: user.max_users,
              maxProjects: user.max_projects
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};
const registerTenant = async (req, res, next) => {
  const client = await db.pool.connect();

  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName
    } = req.body;

    // 1. Validate input
    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    await client.query('BEGIN');

    // 2. Check subdomain uniqueness
    const tenantCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (tenantCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists'
      });
    }

    // 3. Create tenant (default FREE plan)
    const tenantResult = await client.query(
      `
      INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
      VALUES ($1, $2, 'active', 'free', 5, 3)
      RETURNING id, name, subdomain
      `,
      [tenantName, subdomain]
    );

    const tenant = tenantResult.rows[0];

    // 4. Hash admin password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Create tenant admin
    const userResult = await client.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, 'tenant_admin')
      RETURNING id, email, full_name, role
      `,
      [tenant.id, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT');

    // 6. Success response
    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
        adminUser: {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          fullName: userResult.rows[0].full_name,
          role: userResult.rows[0].role
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
const logout = async (req, res, next) => {
  try {
    // JWT-only logout: client removes token
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
  registerTenant,
  logout
};

