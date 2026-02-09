"use client";

import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  decorationUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  fallbackText,
  status = 'online',
  decorationUrl,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-32 h-32 text-3xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-gray-500',
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn(
        "relative rounded-full overflow-hidden bg-indigo-500/20 border-2 border-white/10 flex items-center justify-center text-white font-black uppercase",
        sizeClasses[size]
      )}>
        {src ? (
          <img src={src} alt={alt || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span>{fallbackText?.charAt(0) || <UserIcon size={size === 'xl' ? 48 : 24} />}</span>
        )}
      </div>

      {decorationUrl && (
        <img 
          src={decorationUrl} 
          alt="Decoration" 
          className="absolute inset-0 w-full h-full scale-[1.2] pointer-events-none z-10"
        />
      )}

      <div className={cn(
        "absolute bottom-0 right-0 rounded-full border-2 border-[#020408] z-20",
        statusColors[status],
        size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3.5 h-3.5' : 'w-6 h-6'
      )} />
    </div>
  );
};