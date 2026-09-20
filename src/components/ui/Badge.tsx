import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pass' | 'warn' | 'fail' | 'info' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  return (
    <span className={`badge-status ${variant} ${className}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
