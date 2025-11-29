# Role-Based Access Control (RBAC) Requirements

This document outlines the complete role-based access control system for the FOSYS application.

## 👑 Admin

**Core Function:** System-level authority and governance.

### Permissions:
- ✅ Manage users (create, suspend, assign roles)
- ✅ Manage projects (create/update/delete)
- ✅ Access all dashboards
- ✅ Assign or revoke roles
- ✅ Override PR validations, manually close tasks, PR review, merge and close
- ✅ Access audit logs and webhook configurations

### Restricted From:
- ❌ None — has full privileges

---

## 🧭 Manager

**Core Function:** Oversees execution and delivery of projects.

### Permissions:
- ✅ Create and edit projects
- ✅ Assign tasks to developers or interns
- ✅ Approve or reject Pull Requests (via dashboard UI)
- ✅ Mark project milestones
- ✅ View all project-related employee progress
- ✅ See Comments and feedback on PRs

### Restricted From:
- ❌ Role assignment or user suspension
- ❌ Database-level edits
- ❌ Accessing system logs or admin-only configurations

---

## 💻 Employee

**Core Function:** Core contributor responsible for task execution and PR submissions.

### Permissions:
- ✅ View assigned tasks
- ✅ Push branches and raise Pull Requests
- ✅ Auto Updated task status (in-progress / blocked / ready-for-review) when any action is made like raising PR, PR merged, PR closed
- ✅ View project dashboard (read-only mode)

### Restricted From:
- ❌ Assigning or editing other users' tasks
- ❌ Creating or deleting projects
- ❌ Managing roles or configurations

---

## 🧠 Intern

**Core Function:** Contributor in training or assisting mode.

### Permissions:
- ✅ View and complete assigned tasks
- ✅ Submit PRs
- ✅ View project progress (restricted scope)

### Restricted From:
- ❌ Directly merging PRs
- ❌ Assigning tasks
- ❌ Accessing analytics or sensitive data
- ❌ Editing existing project structure

---

## Implementation Notes

### Permission Enforcement Points

1. **Backend Routes:**
   - User management endpoints should check for ADMIN role
   - Project CRUD should check for ADMIN or MANAGER role
   - Task assignment should check for MANAGER or ADMIN role
   - PR approval/merge should check for MANAGER or ADMIN role
   - Audit logs access should check for ADMIN role only

2. **Frontend Components:**
   - Hide/show UI elements based on user role
   - Disable actions not permitted for the current role
   - Show appropriate error messages when unauthorized actions are attempted

3. **Task Status Auto-Update:**
   - When PR is raised: status → "In Progress"
   - When PR is merged: status → "Completed" or "Ready for Review"
   - When PR is closed: status → appropriate state based on context

### Database Schema

The system uses the `Role` enum with values:
- `ADMIN`
- `MANAGER`
- `EMPLOYEE`
- `INTERN`

Roles are stored in the `Employee` model in the database.

---

## Security Considerations

1. **Role Assignment:** Only ADMIN can assign roles to users
2. **Self-Registration:** New signups default to EMPLOYEE role (lowest privilege for regular users)
3. **Token-Based Auth:** JWT tokens include role information for authorization checks
4. **Middleware Protection:** All protected routes use `protect` middleware and role-specific `restrictTo` middleware

---

Last Updated: Based on project requirements specification

