import { format, isAfter, isBefore, addDays, differenceInDays, parseISO } from 'date-fns';

// Format a date object to display in the UI
export function formatDate(date: Date | string): string {
  try {
    // Handle null or undefined values
    if (!date) {
      return 'Date not set';
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date formatting error';
  }
}

// Check if a date is overdue (in the past)
export function isOverdue(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date());
}

// Check if a date is coming up soon (within the next 3 days)
export function isComingSoon(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const threeDaysFromNow = addDays(new Date(), 3);
  return isAfter(dateObj, new Date()) && isBefore(dateObj, threeDaysFromNow);
}

// Get month name for a given date or month index
export function getMonthName(date: Date | number): string {
  if (typeof date === 'number') {
    // Month index (0-11)
    return format(new Date(2023, date, 1), 'MMM');
  } else {
    return format(date, 'MMM');
  }
}

// Calculate the position in the timeline for a date (0-100%)
export function calculateTimelinePosition(
  date: Date | string, 
  startDate: Date | string, 
  endDate: Date | string
): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const totalDuration = differenceInDays(endObj, startObj);
  if (totalDuration === 0) return 0;
  
  const elapsedDuration = differenceInDays(dateObj, startObj);
  const position = (elapsedDuration / totalDuration) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, position));
}

// Calculate the width in the timeline for a phase (0-100%)
export function calculatePhaseWidth(
  startDate: Date | string, 
  endDate: Date | string,
  timelineStart: Date | string,
  timelineEnd: Date | string
): number {
  const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const timelineStartObj = typeof timelineStart === 'string' ? parseISO(timelineStart) : timelineStart;
  const timelineEndObj = typeof timelineEnd === 'string' ? parseISO(timelineEnd) : timelineEnd;
  
  const timelineDuration = differenceInDays(timelineEndObj, timelineStartObj);
  if (timelineDuration === 0) return 0;
  
  const phaseDuration = differenceInDays(endObj, startObj);
  const width = (phaseDuration / timelineDuration) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, width));
}

// Get an array of sequential months for the timeline
export function getTimelineMonths(
  startDate: Date | string, 
  endDate: Date | string,
  numMonths = 12
): { index: number; name: string }[] {
  const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  
  // Start with the current month of the startDate
  const startMonth = startObj.getMonth();
  const startYear = startObj.getFullYear();
  
  const months = [];
  
  for (let i = 0; i < numMonths; i++) {
    // Calculate month index (0-11) and loop around calendar years
    const monthIndex = (startMonth + i) % 12;
    const yearOffset = Math.floor((startMonth + i) / 12);
    const year = startYear + yearOffset;
    
    // Format month name with year if it's January
    const name = monthIndex === 0 
      ? format(new Date(year, monthIndex, 1), 'MMM yyyy')
      : format(new Date(year, monthIndex, 1), 'MMM');
    
    months.push({
      index: monthIndex,
      name,
      year
    });
  }
  
  return months;
}

// Get relative position in months for the Gantt chart
export function getRelativeMonthPosition(
  date: Date | string,
  timelineStartDate: Date | string
): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const startObj = typeof timelineStartDate === 'string' ? parseISO(timelineStartDate) : timelineStartDate;
  
  // Calculate the difference in months
  const yearDiff = dateObj.getFullYear() - startObj.getFullYear();
  const monthDiff = dateObj.getMonth() - startObj.getMonth();
  
  // Add the day position within the month (0-1 range)
  const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
  const dayPosition = (dateObj.getDate() - 1) / daysInMonth;
  
  return yearDiff * 12 + monthDiff + dayPosition;
}
