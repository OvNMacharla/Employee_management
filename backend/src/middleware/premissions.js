const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
};

const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
};

const requireEmployeeOrAdmin = (user) => {
  requireAuth(user);
  if (!['ADMIN', 'EMPLOYEE'].includes(user.role)) {
    throw new ForbiddenError('Access denied');
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireEmployeeOrAdmin
};