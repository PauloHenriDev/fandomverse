interface FilterStatsProps {
  categories: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  characters: Array<{
    id: string;
    custom_data?: {
      categories?: string[];
    };
  }>;
}

export default function FilterStats({ categories, characters }: FilterStatsProps) {
  const getCharacterCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return characters.length;
    }
    
    return characters.filter(character => 
      character.custom_data?.categories?.includes(categoryId)
    ).length;
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-2">Estatísticas dos Filtros</h3>
      <div className="flex flex-wrap gap-4">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <span className="text-white text-sm">{category.name}:</span>
            <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded text-sm font-semibold">
              {getCharacterCount(category.id)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 