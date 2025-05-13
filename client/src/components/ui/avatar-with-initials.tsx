import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AvatarWithInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarWithInitials = ({ name, size = 'md', className }: AvatarWithInitialsProps) => {
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  return (
    <div 
      className={cn(
        "bg-primary-200 text-primary-800 rounded-full flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <span className="font-medium">{initials}</span>
    </div>
  );
};

export default AvatarWithInitials;
