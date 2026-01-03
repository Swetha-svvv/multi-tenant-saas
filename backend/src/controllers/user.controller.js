const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const updateUser = async (req, res, next) => {
  try {
    const loggedInUser = req.user;           // from JWT middleware
    const targetUserId = req.params.userId; // user being updated
    const { role, isActive, fullName } = req.body;

    // 🔒 AUTHORIZATION CHECKS (PASTE HERE)
    if (
      loggedInUser.role === 'user' &&
      loggedInUser.userId !== targetUserId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    if (
      loggedInUser.role === 'user' &&
      (role !== undefined || isActive !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    // ✅ NOW DO DATABASE UPDATE
    const result = await db.query(
      `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        is_active = COALESCE($3, is_active),
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, full_name, role, is_active, updated_at
      `,
      [fullName, role, isActive, targetUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Prevent self-deletion
    if (currentUser.userId === userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    // Get target user
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userResult.rows[0];

    // Tenant isolation
    if (currentUser.tenantId !== targetUser.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Unassign tasks
    await db.query(
      'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1',
      [userId]
    );

    // Delete user
    await db.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    await logAudit({
  tenantId: currentUser.tenantId,
  userId: currentUser.userId,
  action: 'DELETE_USER',
  entityType: 'user',
  entityId: userId,
  ipAddress: req.ip
});


    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};
//
const listUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.user;

    const result = await db.query(
      `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    res.status(200).json({
      success: true,
      data: {
        users: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

//

module.exports = {
  updateUser,
  deleteUser,
  listUsers
};

