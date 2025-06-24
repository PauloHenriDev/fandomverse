import { ReactNode } from 'react';

// Interface que define as props do componente CardGrid
interface CardGridProps {
  children: ReactNode;    // Conteúdo a ser renderizado (cards)
  className?: string;     // Classes CSS adicionais (opcional)
  gap?: string;          // Espaçamento entre os cards (opcional)
}

/**
 * Componente que cria um grid flexível para organizar cards
 * 
 * Este componente é responsável por:
 * - Organizar cards em um layout flexível
 * - Permitir customização do espaçamento entre cards
 * - Suportar classes CSS adicionais
 * - Usar flex-wrap para responsividade
 */
export default function CardGrid({ 
  children, 
  className = "", 
  gap = "gap-[20px]" 
}: CardGridProps) {
  return (
    // Container flexível que quebra automaticamente para nova linha
    <div className={`flex mt-[10px] ${gap} flex-wrap ${className}`}>
      {children}
    </div>
  );
} 