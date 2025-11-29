import express from "express";
import { PrismaClient } from "@prisma/client";
import { authorizeRoles } from "../auth/roleMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Project Routes with RBAC
 * 
 * Admin & Manager: Can create, update, delete projects
 * All roles: Can view projects
 */

// Create project - Only Admin & Manager
router.post("/create", authorizeRoles(["admin", "manager"]), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await prisma.project.create({
      data: { 
        name, 
        description: description || null 
      },
    });

    res.status(201).json({ 
      message: "Project created successfully",
      project 
    });
  } catch (err) {
    console.error("Project creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update project - Only Admin & Manager
router.patch("/:id", authorizeRoles(["admin", "manager"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ 
      message: "Project updated successfully",
      project: updatedProject 
    });
  } catch (err) {
    console.error("Project update error:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Delete project - Only Admin
router.delete("/:id", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Project deletion error:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(400).json({ error: err.message });
  }
});

// View all projects - All authenticated roles
router.get("/", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          include: {
            employee: true
          }
        },
        _count: {
          select: {
            tasks: true,
            meetings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ 
      message: "Projects fetched successfully",
      projects 
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// View single project - All authenticated roles
router.get("/:id", authorizeRoles(["admin", "manager", "developer", "intern"]), async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: {
          include: {
            employee: true
          }
        },
        meetings: true,
      }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ 
      message: "Project fetched successfully",
      project 
    });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

export default router;

