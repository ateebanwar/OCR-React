import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  sunken?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  sunken = false,
  className = '',
  ...props
}) => {
  const variantClass = sunken ? 'card-sunken' : elevated ? 'card-elevated' : 'card-standard';
  return (
    <div className={`card-component ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
