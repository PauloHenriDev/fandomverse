'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RaceCardProps {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  color?: string;
  fandomId?: string;
}

export default function RaceCard({ 
  id, 
  title, 
  description, 
  image_url, 
  color = "#926DF6",
  fandomId 
}: RaceCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={fandomId ? `/fandom/${fandomId}/races/${id}` : '#'}>
      <div 
        className="bg-white rounded-[10px] p-[15px] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#926DF6]"
        style={{ borderColor: color }}
      >
        <div className="w-full h-[200px] relative mb-[15px] rounded-[8px] overflow-hidden">
          {image_url && !imageError ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: color }}
            >
              {title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-[18px] font-bold text-gray-800 mb-[10px] line-clamp-2">
            {title}
          </h3>
          <p className="text-[14px] text-gray-600 line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
} 