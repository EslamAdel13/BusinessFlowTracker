import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertPhaseSchema, 
  insertTaskSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.get("/users/me", async (req, res) => {
    // In a real app, this would use session/auth middleware
    // For this demo, we'll just return the first user
    const users = Array.from(storage.users.values());
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    
    // Return first user as "current user"
    const user = users[0];
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });
  
  // Project routes
  apiRouter.get("/projects", async (req, res) => {
    try {
      // Get current user (in a real app, would be from auth middleware)
      const users = Array.from(storage.users.values());
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const currentUser = users[0];
      
      // Get projects owned by the user
      const ownedProjects = await storage.getProjectsByOwner(currentUser.email);
      
      // Get projects shared with the user
      const sharedProjects = await storage.getSharedProjects(currentUser.email);
      
      // Combine and return all projects
      const allProjects = [...ownedProjects, ...sharedProjects];
      res.json(allProjects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.post("/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  
  apiRouter.get("/projects/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.patch("/projects/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.delete("/projects/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Phase routes
  apiRouter.get("/projects/:projectId/phases", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const phases = await storage.getPhasesByProject(projectId);
      res.json(phases);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.post("/phases", async (req, res) => {
    try {
      const phaseData = insertPhaseSchema.parse(req.body);
      const phase = await storage.createPhase(phaseData);
      res.status(201).json(phase);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  
  apiRouter.get("/phases/:phaseId", async (req, res) => {
    try {
      const phaseId = parseInt(req.params.phaseId);
      const phase = await storage.getPhase(phaseId);
      
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      
      res.json(phase);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.patch("/phases/:phaseId", async (req, res) => {
    try {
      const phaseId = parseInt(req.params.phaseId);
      const phase = await storage.getPhase(phaseId);
      
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      
      const updatedPhase = await storage.updatePhase(phaseId, req.body);
      res.json(updatedPhase);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.delete("/phases/:phaseId", async (req, res) => {
    try {
      const phaseId = parseInt(req.params.phaseId);
      const phase = await storage.getPhase(phaseId);
      
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      
      await storage.deletePhase(phaseId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Task routes
  apiRouter.get("/phases/:phaseId/tasks", async (req, res) => {
    try {
      const phaseId = parseInt(req.params.phaseId);
      const tasks = await storage.getTasksByPhase(phaseId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.post("/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  
  apiRouter.get("/tasks/:taskId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.patch("/tasks/:taskId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  apiRouter.delete("/tasks/:taskId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all tasks for the current user
  apiRouter.get("/tasks", async (req, res) => {
    try {
      // Get current user (in a real app, would be from auth middleware)
      const users = Array.from(storage.users.values());
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const currentUser = users[0];
      
      // Get tasks assigned to the user
      const tasks = await storage.getTasksByAssignee(currentUser.fullName || currentUser.username);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Register the API router
  app.use("/api", apiRouter);

  return httpServer;
}
