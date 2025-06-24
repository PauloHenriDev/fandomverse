import { ReactNode } from 'react';

// Interface que define a estrutura de uma fandom
interface Fandom {
  id: string;           // ID único da fandom
  name: string;         // Nome da fandom
  description: string;  // Descrição da fandom
  created_at: string;   // Data de criação (string ISO)
  image_url?: string;   // URL da imagem (opcional)
}

// Interface que define as props do componente UserFandomsSection
interface UserFandomsSectionProps {
  fandoms: Fandom[];                    // Array de fandoms do usuário
  isLoading?: boolean;                  // Estado de carregamento
  onCreateNewFandom?: () => void;       // Função para criar nova fandom
  onEditFandom?: (fandomId: string) => void;    // Função para editar fandom
  onDeleteFandom?: (fandomId: string) => void;  // Função para excluir fandom
  children?: ReactNode;                 // Conteúdo adicional (opcional)
}

/**
 * Componente que exibe as fandoms criadas pelo usuário
 * 
 * Este componente renderiza uma seção completa para gerenciar fandoms:
 * - Lista todas as fandoms do usuário em um grid responsivo
 * - Mostra estado vazio quando não há fandoms
 * - Permite criar, editar e excluir fandoms
 * - Inclui loading state durante carregamento
 */
export default function UserFandomsSection({
  fandoms,
  isLoading = false,
  onCreateNewFandom,
  onEditFandom,
  onDeleteFandom,
  children
}: UserFandomsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Cabeçalho da seção com título e botão de criar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Fandoms</h2>
        <button
          onClick={onCreateNewFandom}
          className="bg-[#926DF6] text-white px-4 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors flex items-center gap-2"
        >
          {/* Ícone de adicionar */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Criar Nova Fandom
        </button>
      </div>

      {/* Renderização condicional baseada no estado */}
      {isLoading ? (
        // Estado de carregamento - mostra spinner
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#926DF6]"></div>
        </div>
      ) : fandoms.length === 0 ? (
        // Estado vazio - quando não há fandoms criadas
        <div className="text-center py-8">
          {/* Ícone ilustrativo para estado vazio */}
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma fandom criada ainda</h3>
          <p className="text-gray-500 mb-4">Comece criando sua primeira fandom para compartilhar com a comunidade!</p>
          <button
            onClick={onCreateNewFandom}
            className="bg-[#926DF6] text-white px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors"
          >
            Criar Primeira Fandom
          </button>
        </div>
      ) : (
        // Estado com fandoms - mostra grid de cards
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Mapeia cada fandom para um card */}
          {fandoms.map((fandom) => (
            <div key={fandom.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Cabeçalho do card com título e botões de ação */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800 truncate">{fandom.name}</h3>
                <div className="flex gap-1">
                  {/* Botão de editar */}
                  <button
                    onClick={() => onEditFandom?.(fandom.id)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Botão de excluir */}
                  <button
                    onClick={() => onDeleteFandom?.(fandom.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Descrição da fandom com limite de 2 linhas */}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{fandom.description}</p>
              {/* Data de criação formatada */}
              <div className="text-xs text-gray-500">
                Criada em {new Date(fandom.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo adicional passado como children */}
      {children}
    </div>
  );
} 