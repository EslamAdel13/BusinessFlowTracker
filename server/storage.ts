import { 
  User, InsertUser, 
  Project, InsertProject, 
  Phase, InsertPhase, 
  Task, InsertTask,
  ProjectMember, InsertProjectMember
} from "@shared/schema";

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

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private phases: Map<number, Phase>;
  private tasks: Map<number, Task>;
  private projectMembers: Map<number, ProjectMember>;
  
  userIdCounter: number;
  projectIdCounter: number;
  phaseIdCounter: number;
  taskIdCounter: number;
  memberIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.phases = new Map();
    this.tasks = new Map();
    this.projectMembers = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.phaseIdCounter = 1;
    this.taskIdCounter = 1;
    this.memberIdCounter = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.ownerId === ownerId
    );
  }
  
  async getSharedProjects(userId: string): Promise<Project[]> {
    // Get all project IDs where this user is a member
    const memberProjectIds = Array.from(this.projectMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.projectId);
    
    // Return all projects with these IDs
    return Array.from(this.projects.values()).filter(
      project => memberProjectIds.includes(project.id)
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const project: Project = { ...insertProject, id, createdAt };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, data: Partial<Project>): Promise<Project | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...data };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Delete all phases and tasks associated with this project first
    const projectPhases = await this.getPhasesByProject(id);
    for (const phase of projectPhases) {
      await this.deletePhase(phase.id);
    }
    
    // Delete project members
    const members = await this.getProjectMembers(id);
    for (const member of members) {
      this.projectMembers.delete(member.id);
    }
    
    return this.projects.delete(id);
  }
  
  // Phase methods
  async getPhase(id: number): Promise<Phase | undefined> {
    return this.phases.get(id);
  }
  
  async getPhasesByProject(projectId: number): Promise<Phase[]> {
    return Array.from(this.phases.values()).filter(
      (phase) => phase.projectId === projectId
    );
  }
  
  async createPhase(insertPhase: InsertPhase): Promise<Phase> {
    const id = this.phaseIdCounter++;
    const phase: Phase = { ...insertPhase, id };
    this.phases.set(id, phase);
    return phase;
  }
  
  async updatePhase(id: number, data: Partial<Phase>): Promise<Phase | undefined> {
    const phase = await this.getPhase(id);
    if (!phase) return undefined;
    
    const updatedPhase = { ...phase, ...data };
    this.phases.set(id, updatedPhase);
    return updatedPhase;
  }
  
  async deletePhase(id: number): Promise<boolean> {
    // Delete all tasks associated with this phase first
    const phaseTasks = await this.getTasksByPhase(id);
    for (const task of phaseTasks) {
      this.tasks.delete(task.id);
    }
    
    return this.phases.delete(id);
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByPhase(phaseId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.phaseId === phaseId)
      .sort((a, b) => a.priority - b.priority);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId)
      .sort((a, b) => a.priority - b.priority);
  }
  
  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.assignee === assignee)
      .sort((a, b) => a.priority - b.priority);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Project Member methods
  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return Array.from(this.projectMembers.values()).filter(
      member => member.projectId === projectId
    );
  }
  
  async addProjectMember(insertMember: InsertProjectMember): Promise<ProjectMember> {
    const id = this.memberIdCounter++;
    const member: ProjectMember = { ...insertMember, id };
    this.projectMembers.set(id, member);
    return member;
  }
  
  async removeProjectMember(projectId: number, userId: string): Promise<boolean> {
    const memberEntry = Array.from(this.projectMembers.entries()).find(
      ([_, member]) => member.projectId === projectId && member.userId === userId
    );
    
    if (memberEntry) {
      return this.projectMembers.delete(memberEntry[0]);
    }
    
    return false;
  }
}

// Create and export the storage instance
export const storage = new MemStorage();

// Add some seed data for demo
const seedData = async () => {
  // Create demo user
  const user = await storage.createUser({
    username: 'demo',
    password: 'password123',
    email: 'demo@example.com',
    fullName: 'Demo User',
    role: 'Project Manager',
    avatarUrl: '',
  });
  
  // Create two projects
  const project1 = await storage.createProject({
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    ownerId: user.email,
    color: '#3b82f6', // blue
  });
  
  const project2 = await storage.createProject({
    name: 'Product Launch',
    description: 'Q3 new product release',
    ownerId: user.email,
    color: '#8b5cf6', // purple
  });
  
  // Create phases for website redesign
  const phase1 = await storage.createPhase({
    projectId: project1.id,
    name: 'Research',
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-02-15'),
    deliverable: 'Market research and competitor analysis report',
    responsible: 'John Doe',
    status: 'completed',
    progress: 100,
  });
  
  const phase2 = await storage.createPhase({
    projectId: project1.id,
    name: 'Design',
    startDate: new Date('2023-02-15'),
    endDate: new Date('2023-04-30'),
    deliverable: 'UI/UX design mockups and wireframes',
    responsible: 'Sarah Johnson',
    status: 'in_progress',
    progress: 45,
  });
  
  const phase3 = await storage.createPhase({
    projectId: project1.id,
    name: 'Development',
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-07-01'),
    deliverable: 'Functioning website with all features',
    responsible: 'Michael Chen',
    status: 'not_started',
    progress: 0,
  });
  
  // Create phases for product launch
  const phase4 = await storage.createPhase({
    projectId: project2.id,
    name: 'Planning',
    startDate: new Date('2023-02-15'),
    endDate: new Date('2023-03-15'),
    deliverable: 'Project plan and resource allocation',
    responsible: 'Emily Clark',
    status: 'completed',
    progress: 100,
  });
  
  const phase5 = await storage.createPhase({
    projectId: project2.id,
    name: 'Development',
    startDate: new Date('2023-03-15'),
    endDate: new Date('2023-06-15'),
    deliverable: 'Product prototype',
    responsible: 'James Wilson',
    status: 'in_progress',
    progress: 65,
  });
  
  const phase6 = await storage.createPhase({
    projectId: project2.id,
    name: 'Marketing',
    startDate: new Date('2023-06-15'),
    endDate: new Date('2023-08-15'),
    deliverable: 'Marketing materials and campaign plan',
    responsible: 'Lisa Zhang',
    status: 'not_started',
    progress: 0,
  });
  
  // Create tasks for phases
  await storage.createTask({
    phaseId: phase1.id,
    projectId: project1.id,
    name: 'Analyze competitor websites',
    assignee: 'John Doe',
    dueDate: new Date('2023-01-25'),
    status: 'done',
    priority: 0,
  });
  
  await storage.createTask({
    phaseId: phase1.id,
    projectId: project1.id,
    name: 'Conduct user interviews',
    assignee: 'John Doe',
    dueDate: new Date('2023-02-05'),
    status: 'done',
    priority: 1,
  });
  
  await storage.createTask({
    phaseId: phase2.id,
    projectId: project1.id,
    name: 'Create wireframes',
    assignee: 'Sarah Johnson',
    dueDate: new Date('2023-03-15'),
    status: 'done',
    priority: 0,
  });
  
  await storage.createTask({
    phaseId: phase2.id,
    projectId: project1.id,
    name: 'Design system components',
    assignee: 'Sarah Johnson',
    dueDate: new Date('2023-04-15'),
    status: 'doing',
    priority: 1,
  });
  
  await storage.createTask({
    phaseId: phase4.id,
    projectId: project2.id,
    name: 'Define project scope',
    assignee: 'Emily Clark',
    dueDate: new Date('2023-02-25'),
    status: 'done',
    priority: 0,
  });
  
  await storage.createTask({
    phaseId: phase5.id,
    projectId: project2.id,
    name: 'Develop core features',
    assignee: 'James Wilson',
    dueDate: new Date('2023-04-30'),
    status: 'doing',
    priority: 0,
  });
};

// Call the seed function
seedData();
