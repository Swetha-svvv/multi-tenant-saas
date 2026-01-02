const tenantMiddleware = (req, res, next) => {
  // Super admin can access all tenants
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Tenant users must have tenantId
  if (!req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant access denied'
    });
  }

  // Attach tenantId to request for controllers
  req.tenantId = req.user.tenantId;

  next();
};

module.exports = tenantMiddleware;
