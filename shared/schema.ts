import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const phaseStatusEnum = pgEnum('phase_status', ['not_started', 'in_progress', 'completed', 'overdue']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'doing', 'done']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role"),
  avatarUrl: text("avatar_url"),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  owner_id: text("owner_id").notNull(),
  color: text("color").default('#6366f1'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Members table (for collaboration)
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  user_id: text("user_id").notNull(),
  role: text("role").default('member'),
});

// Phases table
export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  deliverable: text("deliverable"),
  responsible: text("responsible"),
  status: text("status").notNull().default('not_started'), // Using text instead of enum for flexibility
  progress: integer("progress").default(0),
  color: text("color").default('#808080'), // Default color for new phases
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  phase_id: integer("phase_id").notNull(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  assignee: text("assignee"),
  due_date: timestamp("due_date"),
  status: text("status").notNull().default('todo'), // Using text instead of enum for flexibility
  priority: integer("priority").default(0),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  avatarUrl: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  owner_id: true,
  color: true,
});

export const insertPhaseSchema = createInsertSchema(phases).pick({
  project_id: true,
  name: true,
  start_date: true,
  end_date: true,
  deliverable: true,
  responsible: true,
  status: true,
  progress: true,
  color: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  phaseId: true,
  projectId: true,
  name: true,
  assignee: true,
  dueDate: true,
  status: true,
  priority: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Phase = typeof phases.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Project Member type
export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projectsOwned: many(projects, { relationName: 'owner' }),
  projectMemberships: many(projectMembers, { relationName: 'memberUser' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.owner_id],
    references: [users.email],
    relationName: 'owner'
  }),
  phases: many(phases, { relationName: 'projectPhases' }),
  tasks: many(tasks, { relationName: 'projectTasks' }),
  members: many(projectMembers, { relationName: 'projectMembers' }),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  project: one(projects, {
    fields: [phases.project_id],
    references: [projects.id],
    relationName: 'projectPhases'
  }),
  tasks: many(tasks, { relationName: 'phaseTasks' }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id],
    relationName: 'projectTasks'
  }),
  phase: one(phases, {
    fields: [tasks.phase_id],
    references: [phases.id],
    relationName: 'phaseTasks'
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.project_id],
    references: [projects.id],
    relationName: 'projectMembers'
  }),
  user: one(users, {
    fields: [projectMembers.user_id],
    references: [users.email],
    relationName: 'memberUser'
  }),
}));
