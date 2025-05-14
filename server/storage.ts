import { 
  users, User, InsertUser, 
  projects, Project, InsertProject, 
  phases, Phase, InsertPhase, 
  tasks, Task, InsertTask,
  projectMembers, ProjectMember, InsertProjectMember
} from "@shared/schema";
import { db } from './db';
import { eq, and, or } from 'drizzle-orm';

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByOwner(ownerId: string): Promise<Project[]>;
  getSharedProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Phase methods
  getPhase(id: number): Promise<Phase | undefined>;
  getPhasesByProject(projectId: number): Promise<Phase[]>;
  createPhase(phase: InsertPhase): Promise<Phase>;
  updatePhase(id: number, data: Partial<Phase>): Promise<Phase | undefined>;
  deletePhase(id: number): Promise<boolean>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByPhase(phaseId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByAssignee(assignee: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Project Member methods
  getProjectMembers(projectId: number): Promise<ProjectMember[]>;
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  removeProjectMember(projectId: number, userId: string): Promise<boolean>;
}

// Database implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.ownerId, ownerId));
  }

  async getSharedProjects(userId: string): Promise<Project[]> {
    const memberProjects = await db.select({
      projectId: projectMembers.projectId
    }).from(projectMembers).where(eq(projectMembers.userId, userId));
    
    if (memberProjects.length === 0) return [];
    
    const projectIds = memberProjects.map(m => m.projectId);
    // Use OR condition for each project ID
    return await db.select().from(projects).where(
      or(...projectIds.map(id => eq(projects.id, id)))
    );
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // First delete all phases and tasks associated with this project
    const projectPhases = await this.getPhasesByProject(id);
    for (const phase of projectPhases) {
      await this.deletePhase(phase.id);
    }
    
    // Delete project members
    await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
    
    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  async getPhase(id: number): Promise<Phase | undefined> {
    const [phase] = await db.select().from(phases).where(eq(phases.id, id));
    return phase;
  }

  async getPhasesByProject(projectId: number): Promise<Phase[]> {
    return await db.select().from(phases).where(eq(phases.projectId, projectId));
  }

  async createPhase(phase: InsertPhase): Promise<Phase> {
    const [newPhase] = await db.insert(phases).values(phase).returning();
    return newPhase;
  }

  async updatePhase(id: number, data: Partial<Phase>): Promise<Phase | undefined> {
    const [updatedPhase] = await db.update(phases).set(data).where(eq(phases.id, id)).returning();
    return updatedPhase;
  }

  async deletePhase(id: number): Promise<boolean> {
    // Delete all tasks in this phase first
    await db.delete(tasks).where(eq(tasks.phaseId, id));
    
    // Delete the phase
    await db.delete(phases).where(eq(phases.id, id));
    return true;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByPhase(phaseId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.phaseId, phaseId));
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignee, assignee));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return await db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
  }

  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db.insert(projectMembers).values(member).returning();
    return newMember;
  }

  async removeProjectMember(projectId: number, userId: string): Promise<boolean> {
    await db.delete(projectMembers).where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    );
    return true;
  }
}

// Initialize storage with database implementation
export const storage = new DatabaseStorage();