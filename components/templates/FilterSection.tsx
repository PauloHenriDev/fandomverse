interface FilterButton {
  id: string;
  label: string;
  isActive?: boolean;
}

interface FilterSectionProps {
  title: string;
  description: string;
  filters: FilterButton[];
  onFilterChange?: (filterId: string) => void;
  showLoadMore?: boolean;
  loadMoreText?: string;
  onLoadMore?: () => void;
}

export default function FilterSection({
  title,
  description,
  filters,
  onFilterChange,
  showLoadMore = false,
  loadMoreText = "Ver mais",
  onLoadMore
}: FilterSectionProps) {
  return (
    <div>
      <h2 className="text-[40px] font-bold">{title}</h2>
      <p className="text-[20px] mt-[10px]">{description}</p>
      
      {/* Botões de Filtro */}
      <div className="bg-blue-500 p-[5px] rounded-[10px] w-fit max-w-full mt-[15px] overflow-hidden">
        <div className="flex text-[15px] overflow-x-auto gap-[10px]">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`pt-[10px] pb-[10px] pl-[20px] pr-[20px] rounded-[10px] transition-all duration-250 whitespace-nowrap ${
                filter.isActive 
                  ? 'bg-red-500 text-white' 
                  : 'hover:bg-red-500 hover:text-white'
              }`}
              onClick={() => onFilterChange?.(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botão de ver mais */}
      {showLoadMore && (
        <div className="flex justify-center items-center mt-[10px]">
          <button 
            className="bg-red-500 p-[10px] rounded-[10px] text-white hover:bg-red-600 transition-colors"
            onClick={onLoadMore}
          >
            {loadMoreText}
          </button>
        </div>
      )}
    </div>
  );
} 