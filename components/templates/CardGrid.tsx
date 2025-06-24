import { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
  className?: string;
  gap?: string;
}

export default function CardGrid({ 
  children, 
  className = "", 
  gap = "gap-[20px]" 
}: CardGridProps) {
  return (
    <div className={`flex mt-[10px] ${gap} flex-wrap ${className}`}>
      {children}
    </div>
  );
} 