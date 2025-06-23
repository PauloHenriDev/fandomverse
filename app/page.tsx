import Header from "@/components/ui/Header";
import FamdomCard from "@/components/ui/FamdomCard";

export default function Home() {
  return (
    <main className="bg-[#875CF5]">
      <Header />
      <div className="flex flex-col items-center mt-[20px]">
        <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
        <p className="text-[20px] text-[#E3DBFC]">Explore comunidades dedicadas aos seus universos favoritos. Conecte-se com outros fãs, compartilhe teorias e celebre suas paixões.</p>
      </div>
      <div className="flex flex-col items-center pl-[150px] pr-[150px]">
        <p>search bar</p>
        <div className="flex flex-wrap gap-[20px]">
          <FamdomCard />
        </div>
      </div>
    </main>
  );
}
