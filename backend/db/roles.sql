-- ============================================================================
-- RBAC Roles Table Schema
-- ============================================================================
-- 
-- Purpose: Defines the available roles in the Role-Based Access Control system.
-- This table stores all role definitions with their descriptions.
-- 
-- Compatibility: Supabase/PostgreSQL
-- 
-- Usage: Run this script in Supabase SQL Editor to create the roles table
-- and populate it with default roles.
-- 
-- ============================================================================

-- Create the roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
-- Note: If migrating from existing system, adjust role names as needed
INSERT INTO roles (name, description) VALUES
    ('admin', 'System-level authority with full privileges. Can manage users, projects, override validations, and access all system configurations.'),
    ('manager', 'Oversees project execution and delivery. Can create/edit projects, assign tasks, approve PRs, and view employee progress.'),
    ('developer', 'Core contributor responsible for task execution and PR submissions. Can view assigned tasks, raise PRs, and update task status.'),
    ('intern', 'Contributor in training mode. Can view and complete assigned tasks, submit PRs, and view restricted project progress.')
ON CONFLICT (name) DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Add comment to table
COMMENT ON TABLE roles IS 'Stores all available roles in the RBAC system';

-- Add comments to columns
COMMENT ON COLUMN roles.id IS 'Primary key - auto-incrementing serial ID';
COMMENT ON COLUMN roles.name IS 'Unique role identifier (admin, manager, developer, intern)';
COMMENT ON COLUMN roles.description IS 'Human-readable description of the role and its permissions';
COMMENT ON COLUMN roles.created_at IS 'Timestamp when the role was created';
COMMENT ON COLUMN roles.updated_at IS 'Timestamp when the role was last updated';

