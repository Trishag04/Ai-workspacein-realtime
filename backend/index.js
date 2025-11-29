import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bcrypt from 'bcrypt'; // Needed for hashing
import jwt from 'jsonwebtoken'; // Needed for tokens

// Local files (ensure paths are correct relative to index.js)
import prRoutes from "./routes/pr.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/tasks.js";
import githubWebhookRouter from "./webhook.js"; 
import { createPR } from "./createPR.js";
import { protect, restrictTo } from './middleware/auth.js'; // Correct path to middleware

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const signToken = id => {
    // Note: We include the role in the JWT payload for restriction checks
    return jwt.sign({ id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// =========================================================================
// 1. PUBLIC AUTHENTICATION ROUTES
// =========================================================================

// --- SIGNUP ROUTE ---
// --- SIGNUP ROUTE (Public Access, Role is FORCED) ---
app.post("/signup", async (req, res) => {
    try {
        // We only extract what we need. We IGNORE the 'role' field from the body.
        const { name, email, password } = req.body; 

        if (!password) {
             return res.status(400).json({ error: "Password is required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // VULNERABILITY PREVENTION: We hardcode or default to the lowest privilege role.
        const defaultRole = 'EMPLOYEE'; 
        
        const employee = await prisma.employee.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: defaultRole // <-- HARDCODED LOW-LEVEL ROLE
            },
        });

        const token = jwt.sign({ id: employee.id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: "User created successfully", 
            token, 
            user: { id: employee.id, email: employee.email, role: employee.role } 
        });
    } catch (err) {
        if (err.code === 'P2002') { 
            return res.status(409).json({ error: "Email already exists." });
        }
        console.error("Signup error:", err);
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

// --- SIGN-IN (LOGIN) ROUTE ---
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await prisma.employee.findUnique({
            where: { email: email },
            select: { id: true, email: true, role: true, name: true, password: true }
        });

        if (!employee) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // --- DEBUG LOGGING ADDED FOR TROUBLESHOOTING ---
        console.log("Input Password:", password);
        console.log("DB Hashed Password:", employee.password);
        // --- END DEBUG LOGGING ---

        const passwordMatch = employee.password ? await bcrypt.compare(password, employee.password) : false;

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign({ id: employee.id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            success: true,
            token,
            user: { id: employee.id, email: employee.email, role: employee.role },
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during sign-in." });
    }
});


// =========================================================================
// 2. THIRD-PARTY ROUTERS (Applied early)
// =========================================================================
app.use("/pr", prRoutes);
app.use("/webhooks", githubWebhookRouter);

// =========================================================================
// 3. RBAC-PROTECTED ROUTES (Using Supabase Auth)
// =========================================================================
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);


// =========================================================================
// 4. LEGACY PROTECTED API ENDPOINTS (Using JWT Auth)
// =========================================================================

// ✅ Employees (GET: All authenticated users; POST: ADMIN/MANAGER only)
app.get("/employees", protect, async (req, res) => {
    const employees = await prisma.employee.findMany();
    res.json(employees);
});

// ✅ Employees (POST: ONLY ADMIN/MANAGER can create a user)
app.post("/employees", protect, restrictTo('ADMIN', 'MANAGER'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body; 

        if (!password) {
            return res.status(400).json({ error: "Password is required for new employee creation." });
        }
        
        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. The role is taken from the request, but for security:
        //    Ensure the role is valid (e.g., ADMIN, MANAGER, EMPLOYEE, INTERN)
        //    If the Admin/Manager specifies a role, that role is used.
        
        const employee = await prisma.employee.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: role // The Admin/Manager submitting the form sets the role
            },
        });
        
        res.status(201).json({ 
            id: employee.id, 
            name: employee.name, 
            email: employee.email, 
            role: employee.role 
        });

    } catch (err) {
        if (err.code === 'P2002') { 
            return res.status(409).json({ error: "Email already exists." });
        }
        console.error("Employee creation error:", err);
        res.status(500).json({ error: 'Failed to create employee.' });
    }
});

// ✅ Projects (GET: All authenticated users; POST: ADMIN/MANAGER only)
app.get("/projects", protect, async (req, res) => {
    const projects = await prisma.project.findMany();
    res.json(projects);
});

app.post("/projects", protect, restrictTo('ADMIN', 'MANAGER'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await prisma.project.create({
            data: { name, description },
        });
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ✅ Tasks (GET, POST, PATCH, Raise PR)
app.get("/tasks", protect, async (req, res) => {
    const tasks = await prisma.task.findMany({
        include: { project: true, employee: true },
    });
    res.json(tasks);
});

app.post("/tasks", protect, async (req, res) => {
    try {
        const { title, description, status, projectId, assignedTo } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                project: { connect: { id: projectId } },
                employee: assignedTo ? { connect: { id: assignedTo } } : undefined,
            },
        });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/projects/:id/tasks', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await prisma.task.findMany({
            where: { projectId: parseInt(id) },
            include: {
                project: true,
                employee: true,
            },
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks for project' });
    }
});

app.patch('/tasks/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, assignedTo } = req.body;

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                status,
                assignedTo,
            },
        });

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.post("/tasks/:id/raise-pr", protect, async (req, res) => {
    const taskId = parseInt(req.params.id);
    const authorId = req.user ? req.user.id : 1; 
    const { branchName } = req.body;

    try {
        const pr = await createPR(taskId, branchName);
        
        await prisma.pr.create({
            data: {
                url: pr.html_url,
                taskId: taskId,
                authorId: authorId, 
            },
        });
        res.json({ message: "PR created", pr });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create PR" });
    }
});


// =========================================================================
// SERVER START
// =========================================================================

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));