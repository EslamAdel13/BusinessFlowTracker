import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
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
  ownerId: text("owner_id").notNull(),
  color: text("color").default('#6366f1'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Members table (for collaboration)
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").default('member'),
});

// Phases table
export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  deliverable: text("deliverable"),
  responsible: text("responsible"),
  status: text("status").notNull().default('not_started'), // Using text instead of enum for flexibility
  progress: integer("progress").default(0),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  phaseId: integer("phase_id").notNull(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  assignee: text("assignee"),
  dueDate: timestamp("due_date"),
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
  ownerId: true,
  color: true,
});

export const insertPhaseSchema = createInsertSchema(phases).pick({
  projectId: true,
  name: true,
  startDate: true,
  endDate: true,
  deliverable: true,
  responsible: true,
  status: true,
  progress: true,
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
