// Helper functions for date calculations and manipulation

import { addMonths, format, differenceInDays, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import dayjs from 'dayjs';

// Get month index (0-11) from a date string
export const monthIndex = (date: string) => dayjs(date).month();

// Get color based on phase status
export const statusColor = (status: string) => {
  switch (status) {
    case 'completed':   return '#22c55e';  // green
    case 'in_progress': return '#3b82f6';  // blue
    case 'overdue':     return '#ef4444';  // red
    default:            return '#a855f7';  // not_started / default
  }
};

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
  // Handle potential invalid dates
  try {
    // Ensure we have valid date strings or objects
    if (!startDate || !endDate) {
      console.warn('Missing date values for phase calculation');
      return { left: 0, width: 0 };
    }

    // Parse dates safely
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date values:', { startDate, endDate });
      return { left: 0, width: 0 };
    }

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
    
    // Calculate position and width with more precision
    // Get the exact number of days in the timeline period
    const totalTimelineDays = differenceInDays(timelineEnd, timelineStart);
    const totalTimelineWidth = monthWidth * 12; // 12 months in the timeline
    
    // Calculate pixels per day for more accurate positioning
    const pixelsPerDay = totalTimelineWidth / totalTimelineDays;
    
    // Calculate position with more precision
    const left = daysFromStart * pixelsPerDay;
    const width = phaseDuration * pixelsPerDay;
    
    console.log('Phase alignment calculation:', {
      phase: 'Phase calculation',
      start: adjustedStart.toISOString(),
      end: adjustedEnd.toISOString(),
      timelineStart: timelineStart.toISOString(),
      daysFromStart,
      phaseDuration,
      pixelsPerDay,
      left,
      width
    });
    
    return { left, width };
  } catch (error) {
    console.error('Error calculating phase position:', error);
    return { left: 0, width: 0 };
  }
}

// Format date for display
export function formatDateRange(startDate?: string | Date, endDate?: string | Date): string {
  if (!startDate || !endDate) return 'Date range not set';
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date range';
    }
    
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Error formatting date range';
  }
}

// Convert timeline position to date
export function positionToDate(posX: number, timelineStartDate: Date, monthWidth: number = 120): Date {
  // Calculate days from timeline start based on position
  const timelineStart = startOfMonth(timelineStartDate);
  const timelineEnd = endOfMonth(addMonths(timelineStart, 11));
  
  // Calculate total timeline width and days
  const totalTimelineWidth = monthWidth * 12;
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  // Calculate days from start
  const daysFromStart = (posX / totalTimelineWidth) * totalDays;
  
  // Create new date
  const newDate = new Date(timelineStart);
  newDate.setDate(newDate.getDate() + Math.round(daysFromStart));
  
  return newDate;
}

// Convert date to timeline position
export function dateToPosition(date: Date, timelineStartDate: Date, monthWidth: number = 120): number {
  const timelineStart = startOfMonth(timelineStartDate);
  const timelineEnd = endOfMonth(addMonths(timelineStart, 11));
  
  // Calculate total timeline width and days
  const totalTimelineWidth = monthWidth * 12;
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  // Calculate days from start
  const daysFromStart = differenceInDays(date, timelineStart);
  
  // Calculate position
  return (daysFromStart / totalDays) * totalTimelineWidth;
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
