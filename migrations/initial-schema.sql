-- Create types
CREATE TYPE IF NOT EXISTS phase_status AS ENUM ('not_started', 'in_progress', 'completed', 'overdue');
CREATE TYPE IF NOT EXISTS task_status AS ENUM ('todo', 'doing', 'done');

-- Create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT,
  avatar_url TEXT
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members table
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member'
);

-- Phases table
CREATE TABLE IF NOT EXISTS phases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  deliverable TEXT,
  responsible TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress INTEGER DEFAULT 0
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  assignee TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'todo',
  priority INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_phases_project ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);