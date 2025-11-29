# Quick Start - RBAC Setup

## Step 1: Install Dependencies

```bash
cd backend
npm install @supabase/supabase-js
```

## Step 2: Set Environment Variables

Add to your `.env` file:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find these:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → `PUBLIC_SUPABASE_URL`
- Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

## Step 3: Run Database Scripts

1. Go to **Supabase SQL Editor**
2. Run `backend/db/roles.sql` first
3. Then run `backend/db/user_roles.sql`

## Step 4: Test the Setup

### Get a Supabase Auth Token

You can get a token from:
- **Supabase Dashboard** → Authentication → Users → Select user → Copy token
- Or from your login flow if using Supabase Auth SDK

### Test Endpoints

**Create Project (Admin/Manager only):**
```bash
POST http://localhost:4000/api/projects/create
Headers:
  Authorization: Bearer <your_supabase_token>
Body:
  {
    "name": "Test Project",
    "description": "Test description"
  }
```

**View Projects (All roles):**
```bash
GET http://localhost:4000/api/projects
Headers:
  Authorization: Bearer <your_supabase_token>
```

## Available Routes

### Projects (`/api/projects`)
- `POST /create` - Create project (admin, manager)
- `PATCH /:id` - Update project (admin, manager)
- `DELETE /:id` - Delete project (admin only)
- `GET /` - View all projects (all roles)
- `GET /:id` - View single project (all roles)

### Tasks (`/api/tasks`)
- `POST /create` - Create task (admin, manager)
- `PATCH /:id/assign` - Assign task (admin, manager)
- `PATCH /:id` - Update task (all roles, with restrictions)
- `POST /:id/raise-pr` - Raise PR (all roles)
- `GET /` - View tasks (all roles, filtered by role)
- `GET /:id` - View single task (all roles)

## Role Permissions

| Route | Admin | Manager | Developer | Intern |
|-------|-------|---------|-----------|-------|
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |
| Assign Task | ✅ | ✅ | ❌ | ❌ |
| Raise PR | ✅ | ✅ | ✅ | ✅ |
| View All Tasks | ✅ | ✅ | Own only | Own only |

## Troubleshooting

**Error: "Missing token"**
- Ensure `Authorization: Bearer <token>` header is present

**Error: "Invalid token"**
- Check that token is a valid Supabase Auth JWT
- Verify environment variables are correct

**Error: "User role not found"**
- Ensure user has a role assigned in `user_roles` table
- Verify `user_roles_view` exists

**Error: "Access denied"**
- Check user's role in database
- Verify role names match: `admin`, `manager`, `developer`, `intern`


