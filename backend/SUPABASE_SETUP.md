# Supabase Integration Setup

This guide explains how to set up Supabase Auth integration for RBAC.

## Prerequisites

1. **Install Supabase Client**
   ```bash
   cd backend
   npm install @supabase/supabase-js
   ```

2. **Environment Variables**

   Add these to your `.env` file:

   ```env
   # Supabase Configuration
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   To find these values:
   - Go to your Supabase Dashboard
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** (PUBLIC_SUPABASE_URL)
   - Copy the **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - **Keep this secret!**

## Database Setup

Before using the RBAC middleware, ensure you've run the SQL scripts:

1. Go to Supabase SQL Editor
2. Run `backend/db/roles.sql` first
3. Then run `backend/db/user_roles.sql`

## Testing the Setup

### 1. Get a Supabase Auth Token

You can get a token by:

- **Option A**: Using Supabase Auth SDK in your frontend
- **Option B**: Manual token from Supabase Dashboard → Authentication → Users → View user → Copy token
- **Option C**: Through your login flow if integrated with Supabase Auth

### 2. Test Endpoints

#### Create Project (Admin/Manager only)
```bash
POST https://your-api-url/api/projects/create
Headers:
  Authorization: Bearer <supabase_jwt_token>
Body:
  {
    "name": "New Project",
    "description": "Project description"
  }
```

#### View Projects (All roles)
```bash
GET https://your-api-url/api/projects
Headers:
  Authorization: Bearer <supabase_jwt_token>
```

#### Create Task (Admin/Manager only)
```bash
POST https://your-api-url/api/tasks/create
Headers:
  Authorization: Bearer <supabase_jwt_token>
Body:
  {
    "title": "New Task",
    "description": "Task description",
    "projectId": 1,
    "assignedTo": 1
  }
```

## Migration Notes

### Current System vs Supabase Auth

**Current System:**
- Uses JWT tokens signed with `JWT_SECRET`
- Stores users in `Employee` table (Prisma)
- Roles stored directly in `Employee.role` field

**New Supabase System:**
- Uses Supabase Auth tokens
- Users in `auth.users` table (Supabase)
- Roles stored in `user_roles` junction table

### Migration Path

To fully migrate to Supabase Auth, you'll need to:

1. **Link Supabase users to Prisma Employee records**
   - Option A: Add `supabase_user_id UUID` column to `Employee` table
   - Option B: Create a mapping table

2. **Migrate existing users**
   - Create Supabase Auth accounts for existing employees
   - Link Supabase user IDs to Employee records
   - Assign roles in `user_roles` table

3. **Update authentication flow**
   - Change login/signup to use Supabase Auth
   - Update frontend to use Supabase Auth SDK

## Troubleshooting

### Error: "User role not found"
- Ensure the user has been assigned a role in the `user_roles` table
- Verify the `user_roles_view` exists and is accessible

### Error: "Invalid token"
- Check that the token is a valid Supabase Auth JWT
- Verify `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure the token hasn't expired

### Error: "Access denied"
- Verify the user's role in `user_roles` table
- Check that the allowed roles in route match the role names (case-insensitive)
- Ensure role names match: `admin`, `manager`, `developer`, `intern`

## Role Mapping

| RBAC Document | Database Role | Notes |
|--------------|---------------|-------|
| Admin | `admin` | Full privileges |
| Manager | `manager` | Project oversight |
| Employee | `developer` | Core contributor |
| Intern | `intern` | Training mode |

**Note:** The SQL scripts use `developer` instead of `employee` to match common naming conventions. Update if needed.


