import { ReactNode } from 'react';

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  padding?: string;
  marginTop?: string;
}

export default function PageSection({ 
  children, 
  className = "",
  padding = "pl-[250px] pr-[250px]",
  marginTop = "mt-[10px]"
}: PageSectionProps) {
  return (
    <div className={`${padding} ${marginTop} ${className}`}>
      {children}
    </div>
  );
} 