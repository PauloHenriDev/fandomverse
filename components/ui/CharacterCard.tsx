import Link from 'next/link';

interface CharacterCardProps {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  color?: string;
  fandomId?: string;
}

export default function CharacterCard({ 
  id,
  title, 
  description, 
  image_url, 
  color = '#926DF6',
  fandomId
}: CharacterCardProps) {
  const cardContent = (
    <div className="w-[300px] h-[500px] relative group flex flex-col">
      {/* Imagem do Personagem */}
      <div 
        className="flex w-full h-[250px] rounded-t-[10px] justify-center items-center overflow-hidden flex-shrink-0"
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
            <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <p className="text-xs">Sem Imagem</p>
          </div>
        )}
      </div>
      
      {/* Informações do Personagem */}
      <div 
        className="flex flex-col items-center text-center justify-start flex-1 pt-0 pb-4 px-2 rounded-b-[10px] min-h-[150px]"
        style={{ backgroundColor: color }}
      >
        <p className="text-[25px] font-bold text-white mt-[15px] mb-0 w-full">{title}</p>
        <p className="text-[18px] text-white opacity-90 leading-relaxed mt-[10px] w-full block break-words">
          {description.length > 400 ? description.slice(0, 400) + '...' : description}
        </p>
      </div>
    </div>
  );

  // Se tiver fandomId, envolve em um Link para tornar clicável
  if (fandomId) {
    return (
      <Link 
        href={`/fandom/${fandomId}/characters/${id}`}
        className="block hover:scale-105 transition-transform duration-200"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}