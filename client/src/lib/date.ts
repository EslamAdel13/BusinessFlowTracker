// Helper functions for date calculations and manipulation

import { addMonths, format, differenceInDays, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';

// Get array of months for timeline
export function getMonthsForTimeline(startDate: Date = new Date(), count: number = 12): string[] {
  const months = [];
  let currentDate = startOfMonth(startDate);
  
  for (let i = 0; i < count; i++) {
    months.push(format(currentDate, 'MMM'));
    currentDate = addMonths(currentDate, 1);
  }
  
  return months;
}

// Calculate position and width for phase bars
export interface PhasePosition {
  left: number;
  width: number;
}

export function calculatePhasePosition(
  startDate: string | Date,
  endDate: string | Date,
  timelineStartDate: Date = new Date(),
  monthWidth: number = 120
): PhasePosition {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timelineStart = startOfMonth(timelineStartDate);
  const timelineEnd = endOfMonth(addMonths(timelineStart, 11));
  
  // If phase is outside of the timeline, don't show it
  if (isAfter(start, timelineEnd) || isBefore(end, timelineStart)) {
    return { left: 0, width: 0 };
  }
  
  // Calculate adjusted start and end dates if they fall outside the timeline
  const adjustedStart = isBefore(start, timelineStart) ? timelineStart : start;
  const adjustedEnd = isAfter(end, timelineEnd) ? timelineEnd : end;
  
  // Calculate days from timeline start
  const daysFromStart = differenceInDays(adjustedStart, timelineStart);
  const phaseDuration = differenceInDays(adjustedEnd, adjustedStart) + 1; // +1 to include the end day
  
  // Calculate position and width
  const daysPerMonth = 30; // Approximate
  const left = (daysFromStart / daysPerMonth) * monthWidth;
  const width = (phaseDuration / daysPerMonth) * monthWidth;
  
  return { left, width };
}

// Format date for display
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

// Get days overdue
export function getDaysOverdue(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const today = new Date();
  
  if (isBefore(due, today)) {
    return differenceInDays(today, due);
  }
  
  return 0;
}
