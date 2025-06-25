import { Fandom } from '@/lib/hooks/useFandoms';
import Link from 'next/link';

interface FamdomCardProps {
  fandom: Fandom;
}

export default function FamdomCard({ fandom }: FamdomCardProps) {
  return (
    <div className="w-[300px]">
        {/* Imagem do Famdom */}
        <div className="flex justify-center items-center bg-red-500 rounded-t-[15px] w-[300px] h-[150px]">
            {fandom.image_url ? (
              <img 
                src={fandom.image_url} 
                alt={fandom.name}
                className="w-full h-full object-cover rounded-t-[15px]"
              />
            ) : (
              <div className="text-white text-center">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p className="text-sm">Imagem do Fandom</p>
              </div>
            )}
        </div>
        {/* Nome, descrição e membros */}
        <div className="flex flex-col items-center pt-[20px] pl-[15px] pr-[15px] bg-[#8D6FF5] rounded-b-[15px]">
            <p className="text-[20px] font-bold text-white">{fandom.name}</p>
            <p className="text-[15px] text-[#DBD1FC] mt-[10px] text-center">
              {fandom.description.length > 150 
                ? `${fandom.description.substring(0, 150)}...` 
                : fandom.description
              }
            </p>
            <div className="flex mt-[10px] gap-[20px] text-[#DBD1FC]">
                <div className="flex gap-[5px]">
                    <p>Membros</p>
                    <p>100</p>
                </div>
                <div className="flex gap-[5px]">
                    <p>Discussões</p>
                    <p>50</p>
                </div>
            </div>
            <div className="w-[100%] mt-[10px] mb-[30px]">
                <Link href={`/fandom/${fandom.id}`}>
                  <button className="bg-[#A28BF7] hover:bg-[#AE9AF8] rounded-[5px] p-[8px] w-[100%] transition-all duration-200">
                    <p>Explorar</p>
                  </button>
                </Link>
            </div>
        </div>
    </div>
  )
}
