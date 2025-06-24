interface HeroSectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export default function HeroSection({
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick
}: HeroSectionProps) {
  return (
    <div className="">
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="text-[75px] text-white font-bold">{title}</h1>
        <div className="flex w-[50%] items-center justify-center">  
          <p className="text-[25px] text-[#E3DBFC] mt-[10px]">{description}</p>
        </div>
        <div className="flex gap-[20px] mt-[30px]">
          <button 
            className="bg-red-500 p-[10px] rounded-[10px] text-white hover:bg-red-600 transition-colors"
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </button>
          <button 
            className="bg-red-500 p-[10px] rounded-[10px] text-white hover:bg-red-600 transition-colors"
            onClick={onSecondaryClick}
          >
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 