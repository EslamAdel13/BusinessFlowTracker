import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'phase' | 'task';
  className?: string;
}

const StatusBadge = ({ status, type, className }: StatusBadgeProps) => {
  const getPhaseStatusStyles = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTaskStatusStyles = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'doing':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const styles = type === 'phase' ? getPhaseStatusStyles(status) : getTaskStatusStyles(status);
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles,
        className
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
