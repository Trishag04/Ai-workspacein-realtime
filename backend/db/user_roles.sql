-- ============================================================================
-- RBAC User Roles Junction Table Schema
-- ============================================================================
-- 
-- Purpose: Creates a many-to-many relationship between users and roles.
-- This allows users to have multiple roles if needed (though typically
-- each user has one primary role).
-- 
-- Compatibility: Supabase/PostgreSQL
-- 
-- Dependencies: 
--   - Requires auth.users table (Supabase Auth)
--   - Requires roles table (run roles.sql first)
-- 
-- Usage: Run this script in Supabase SQL Editor after running roles.sql
-- 
-- ============================================================================

-- Create the user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Add comment to table
COMMENT ON TABLE user_roles IS 'Junction table linking users to their assigned roles in the RBAC system';

-- Add comments to columns
COMMENT ON COLUMN user_roles.user_id IS 'Foreign key to auth.users(id) - the user being assigned a role';
COMMENT ON COLUMN user_roles.role_id IS 'Foreign key to roles(id) - the role being assigned to the user';
COMMENT ON COLUMN user_roles.assigned_at IS 'Timestamp when the role was assigned to the user';
COMMENT ON COLUMN user_roles.assigned_by IS 'UUID of the admin/user who assigned this role (for audit trail)';

-- Optional: Create a view for easier querying of user roles
CREATE OR REPLACE VIEW user_roles_view AS
SELECT 
    ur.user_id,
    u.email,
    r.id AS role_id,
    r.name AS role_name,
    r.description AS role_description,
    ur.assigned_at,
    ur.assigned_by
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id;

COMMENT ON VIEW user_roles_view IS 'Convenience view showing user roles with user and role details joined';

