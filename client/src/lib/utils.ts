import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return "";
  const names = name.split(" ");
  
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isOverdue(date: string | Date): boolean {
  if (!date) return false;
  const dueDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function isWithinDays(date: string | Date, days: number): boolean {
  if (!date) return false;
  const dueDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(today.getDate() + days);
  return dueDate >= today && dueDate <= future;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "not_started":
      return "bg-status-not-started";
    case "in_progress":
      return "bg-status-in-progress";
    case "completed":
      return "bg-status-completed";
    case "overdue":
      return "bg-status-overdue";
    default:
      return "bg-gray-400";
  }
}

export function getTaskStatusColor(status: string): string {
  switch (status) {
    case "todo":
      return "bg-gray-100 text-gray-800";
    case "doing":
      return "bg-yellow-100 text-yellow-800";
    case "done":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getProgressPercentage(progress: number): number {
  if (typeof progress !== "number") return 0;
  return Math.max(0, Math.min(100, progress));
}

export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}
