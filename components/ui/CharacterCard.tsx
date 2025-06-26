import Link from 'next/link';

interface CharacterCardProps {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  color?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
  fandomId?: string;
  showViewMoreButton?: boolean;
}

export default function CharacterCard({ 
  id,
  title, 
  description, 
  image_url, 
  color = '#926DF6',
  onEdit,
  onDelete,
  isEditable = false,
  fandomId,
  showViewMoreButton = true
}: CharacterCardProps) {
  return (
    <div className="w-full max-w-[300px] relative group">
      {/* Imagem do Personagem */}
      <div 
        className="flex w-full aspect-square rounded-t-[10px] justify-center items-center overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {image_url ? (
          <img 
            src={image_url} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <p className="text-xs sm:text-sm">Sem Imagem</p>
          </div>
        )}
      </div>
      
      {/* Informações do Personagem */}
      <div 
        className="flex flex-col items-center text-center justify-center pt-2 sm:pt-[10px] pb-2 sm:pb-[10px] px-2 sm:px-[10px] rounded-b-[10px]"
        style={{ backgroundColor: color }}
      >
        <p className="text-base sm:text-[20px] font-bold text-white line-clamp-1">{title}</p>
        <p className="text-xs sm:text-[15px] mt-2 sm:mt-[10px] text-white opacity-90 line-clamp-3 leading-relaxed">
          {description}
        </p>
        
        {/* Botão "Ver mais" - pode ser um link ou botão simples */}
        {showViewMoreButton && (
          fandomId ? (
            <Link 
              href={`/fandom/${fandomId}/characters/${id}`}
              className="bg-white text-gray-800 p-2 sm:p-[10px] rounded-[10px] mt-4 sm:mt-[30px] w-full font-medium hover:bg-gray-100 transition-colors text-xs sm:text-sm block text-center"
              style={{ color: color }}
            >
              Ver mais
            </Link>
          ) : (
            <button 
              className="bg-white text-gray-800 p-2 sm:p-[10px] rounded-[10px] mt-4 sm:mt-[30px] w-full font-medium hover:bg-gray-100 transition-colors text-xs sm:text-sm"
              style={{ color: color }}
            >
              Ver mais
            </button>
          )
        )}
      </div>

      {/* Botões de edição (apenas se for editável) */}
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 transition-colors"
                title="Editar personagem"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Excluir personagem"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}