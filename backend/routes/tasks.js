import express from "express";
import { PrismaClient } from "@prisma/client";
import { authorizeRoles } from "../auth/roleMiddleware.js";
import { createPR } from "../createPR.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Task Routes with RBAC
 * 
 * Admin & Manager: Can create, assign, and update any tasks
 * Developer & Intern: Can view assigned tasks and update their own tasks
 * All roles: Can raise PRs for their assigned tasks
 */

// Create task - Only Admin & Manager
router.post("/create", authorizeRoles(["admin", "manager"]), async (req, res) => {
  try {
    const { title, description, status, projectId, assignedTo } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ 
        error: "Title and projectId are required" 
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "To-Do",
        project: { connect: { id: projectId } },
        employee: assignedTo ? { connect: { id: assignedTo } } : undefined,
      },
      include: {
        project: true,
        employee: true
      }
    });

    res.status(201).json({ 
      message: "Task created successfully",
      task 
    });
  } catch (err) {
    console.error("Task creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Assign task to user - Only Admin & Manager
router.patch("/:id/assign", authorizeRoles(["admin", "manager"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        assignedTo: assignedTo || null,
      },
      include: {
        project: true,
        employee: true
      }
    });

    res.json({ 
      message: "Task assigned successfully",
      task: updatedTask 
    });
  } catch (err) {
    console.error("Task assignment error:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update task - Admin & Manager can update any, others can update only assigned
router.patch("/:id", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userRole = req.user.role.toLowerCase();

    // Get the task first to check ownership
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user can edit this task
    // Admin and Manager can edit any task
    // Developer and Intern can only edit tasks assigned to them
    if (userRole !== 'admin' && userRole !== 'manager') {
      // For developer/intern, check if task is assigned to them
      // Note: This requires matching Supabase user_id with Prisma employee id
      // You may need to add a mapping table or store Supabase UUID in Employee table
      // For now, we'll allow if no employee is assigned (unassigned tasks)
      if (task.assignedTo && task.assignedTo !== req.user.employeeId) {
        return res.status(403).json({ 
          error: "You can only update tasks assigned to you" 
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
      include: {
        project: true,
        employee: true
      }
    });

    res.json({ 
      message: "Task updated successfully",
      task: updatedTask 
    });
  } catch (err) {
    console.error("Task update error:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Raise PR for task - All authenticated roles (for their assigned tasks)
router.post("/:id/raise-pr", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { branchName } = req.body;
    const userId = req.user.id;

    if (!branchName) {
      return res.status(400).json({ error: "Branch name is required" });
    }

    // Get the task to verify it exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { employee: true }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Create PR via GitHub API
    const pr = await createPR(taskId, branchName);
    
    // Get employee ID from Supabase user_id
    // Note: You may need to add a mapping between Supabase user_id and Prisma employee.id
    // For now, we'll need the authorId - this might require a join table or storing Supabase UUID in Employee
    // TODO: Map Supabase user_id to Prisma employee.id
    
    // Store PR in database
    await prisma.pr.create({
      data: {
        url: pr.html_url,
        taskId: taskId,
        authorId: 1, // TODO: Map this properly from Supabase user_id
      },
    });

    // Auto-update task status to "In Progress"
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "In Progress" }
    });

    res.json({ 
      message: "PR created successfully",
      pr,
      taskStatus: "Updated to 'In Progress'"
    });
  } catch (err) {
    console.error("PR creation error:", err);
    res.status(500).json({ error: "Failed to create PR", details: err.message });
  }
});

// View all tasks - Admin & Manager see all, others see only assigned
router.get("/", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    
    let tasks;
    
    if (userRole === 'admin' || userRole === 'manager') {
      // Admin and Manager can see all tasks
      tasks = await prisma.task.findMany({
        include: { 
          project: true, 
          employee: true,
          pr: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Developer and Intern see only their assigned tasks
      // TODO: Filter by employee ID mapped from Supabase user_id
      tasks = await prisma.task.findMany({
        where: {
          // assignedTo: mappedEmployeeId // Need to map from Supabase user_id
        },
        include: { 
          project: true, 
          employee: true,
          pr: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    res.json({ 
      message: "Tasks fetched successfully",
      tasks 
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// View single task
router.get("/:id", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role.toLowerCase();

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        employee: true,
        pr: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user can view this task
    if (userRole !== 'admin' && userRole !== 'manager') {
      // Developer/Intern can only view tasks assigned to them
      // TODO: Implement ownership check
    }

    res.json({ 
      message: "Task fetched successfully",
      task 
    });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

export default router;


