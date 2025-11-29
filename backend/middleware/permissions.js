/**
 * Permission Helper Functions
 * 
 * This module provides helper functions to check user permissions
 * based on their role. Use these functions in route handlers to
 * enforce RBAC requirements.
 */

/**
 * Checks if a user has permission to perform an action
 * @param {Object} user - The user object from req.user (must have role property)
 * @param {string} action - The action being performed
 * @returns {boolean} - True if user has permission, false otherwise
 */
export function canPerformAction(user, action) {
  if (!user || !user.role) return false;

  const role = user.role.toUpperCase();

  // Admin has full privileges
  if (role === 'ADMIN') return true;

  // Define permissions for each role
  const permissions = {
    MANAGER: [
      'create_project',
      'edit_project',
      'delete_project',
      'assign_task',
      'approve_pr',
      'reject_pr',
      'view_all_projects',
      'view_employee_progress',
      'mark_milestone',
      'view_pr_comments',
    ],
    EMPLOYEE: [
      'view_assigned_tasks',
      'raise_pr',
      'view_project_dashboard',
      'update_own_task_status',
    ],
    INTERN: [
      'view_assigned_tasks',
      'raise_pr',
      'view_project_progress',
      'complete_assigned_task',
    ],
  };

  const rolePermissions = permissions[role] || [];
  return rolePermissions.includes(action);
}

/**
 * Checks if user can manage other users (create, suspend, assign roles)
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canManageUsers(user) {
  if (!user || !user.role) return false;
  return user.role.toUpperCase() === 'ADMIN';
}

/**
 * Checks if user can create/update/delete projects
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canManageProjects(user) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Checks if user can assign tasks to other users
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canAssignTasks(user) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Checks if user can approve/reject PRs
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canApprovePRs(user) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Checks if user can merge PRs
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canMergePRs(user) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Checks if user can access audit logs
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canAccessAuditLogs(user) {
  if (!user || !user.role) return false;
  return user.role.toUpperCase() === 'ADMIN';
}

/**
 * Checks if user can access webhook configurations
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canAccessWebhookConfigs(user) {
  if (!user || !user.role) return false;
  return user.role.toUpperCase() === 'ADMIN';
}

/**
 * Checks if user can override PR validations
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canOverridePRValidations(user) {
  if (!user || !user.role) return false;
  return user.role.toUpperCase() === 'ADMIN';
}

/**
 * Checks if user can manually close tasks
 * @param {Object} user - The user object from req.user
 * @returns {boolean}
 */
export function canManuallyCloseTasks(user) {
  if (!user || !user.role) return false;
  return user.role.toUpperCase() === 'ADMIN';
}

/**
 * Checks if user can edit other users' tasks
 * @param {Object} user - The user object from req.user
 * @param {number} taskAssignedTo - The ID of the user the task is assigned to
 * @returns {boolean}
 */
export function canEditTask(user, taskAssignedTo) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  
  // Admin and Manager can edit any task
  if (role === 'ADMIN' || role === 'MANAGER') return true;
  
  // Employee and Intern can only edit their own tasks
  if (role === 'EMPLOYEE' || role === 'INTERN') {
    return user.id === taskAssignedTo;
  }
  
  return false;
}

/**
 * Checks if user can view all tasks or only assigned ones
 * @param {Object} user - The user object from req.user
 * @returns {boolean} - True if can view all, false if only assigned
 */
export function canViewAllTasks(user) {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Middleware to check permission before proceeding
 * Usage: app.post('/route', protect, checkPermission('action_name'), handler)
 */
export function checkPermission(action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!canPerformAction(req.user, action)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action.',
        requiredAction: action,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to check if user can manage projects
 */
export function requireProjectManagement(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!canManageProjects(req.user)) {
    return res.status(403).json({ 
      error: 'You do not have permission to manage projects.',
      userRole: req.user.role
    });
  }

  next();
}

/**
 * Middleware to check if user can assign tasks
 */
export function requireTaskAssignment(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!canAssignTasks(req.user)) {
    return res.status(403).json({ 
      error: 'You do not have permission to assign tasks.',
      userRole: req.user.role
    });
  }

  next();
}

/**
 * Middleware to check if user can approve PRs
 */
export function requirePRApproval(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!canApprovePRs(req.user)) {
    return res.status(403).json({ 
      error: 'You do not have permission to approve Pull Requests.',
      userRole: req.user.role
    });
  }

  next();
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role.toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin privileges required.',
      userRole: req.user.role
    });
  }

  next();
}


