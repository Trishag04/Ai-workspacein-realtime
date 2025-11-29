import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

/**
 * RBAC Role Middleware
 * 
 * This middleware integrates with Supabase Auth to check user roles
 * from the user_roles table and authorize access based on allowed roles.
 * 
 * Usage:
 *   router.post("/create", authorizeRoles(["admin", "manager"]), handler);
 */

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Middleware: Check if user has one of the allowed roles
 * @param {string[]} allowedRoles - Array of role names (e.g., ["admin", "manager"])
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: "Missing token" });
      }

      const token = authHeader.replace("Bearer ", "");

      // Validate token with Supabase Auth
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const userId = data.user.id;

      // Fetch role from user_roles_view
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles_view")
        .select("role_name")
        .eq("user_id", userId)
        .single();

      if (roleError || !roleData) {
        return res.status(403).json({ 
          error: "User role not found",
          details: roleError?.message || "No role assigned to user"
        });
      }

      const userRole = roleData.role_name.toLowerCase();

      // Check if user role is in allowed roles (case-insensitive comparison)
      const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());
      
      if (!allowedRolesLower.includes(userRole)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: `Required roles: ${allowedRoles.join(", ")}, User role: ${userRole}`
        });
      }

      // Attach user info to request for use in route handlers
      req.user = { 
        id: userId, 
        role: userRole,
        email: data.user.email
      };
      
      next();
    } catch (err) {
      console.error("Authorization Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

/**
 * Helper function to get user role directly (for use outside middleware)
 * @param {string} userId - Supabase user ID (UUID)
 * @returns {Promise<string|null>} Role name or null if not found
 */
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_roles_view")
      .select("role_name")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    
    return data.role_name.toLowerCase();
  } catch (err) {
    console.error("Error fetching user role:", err);
    return null;
  }
};


