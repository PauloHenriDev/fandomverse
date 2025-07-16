'use client';

import Header from "@/components/ui/Header";
import FamdomCard from "@/components/ui/FamdomCard";
import { CardGrid } from "@/components/templates";
import { useFandoms } from "@/lib/hooks/useFandoms";
import { useState } from "react";

export default function Home() {
  const { fandoms, loading, error } = useFandoms();
  const [search, setSearch] = useState("");

  const filteredFandoms = fandoms.filter(fandom =>
    fandom.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="bg-[#875CF5] min-h-screen">
        <Header />
        <div className="flex flex-col items-center mt-[20px]">
          <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
          <p className="text-[20px] text-[#E3DBFC] mt-[10px]">Carregando fandoms...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[#875CF5] min-h-screen">
        <Header />
        <div className="flex flex-col items-center mt-[20px]">
          <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
          <p className="text-[20px] text-[#E3DBFC] mt-[10px]">Erro ao carregar fandoms: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#875CF5] min-h-screen">
      <Header />
      {/* Texto do Topo */}
      <div className="flex flex-col items-center mt-[20px]">
        <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
        <p className="text-[20px] text-[#E3DBFC] mt-[10px]">Explore comunidades dedicadas aos seus universos favoritos. Conecte-se com outros fãs, compartilhe teorias e celebre suas paixões.</p>
      </div>

      <div className="flex flex-col items-center pl-[150px] pr-[150px] mt-[20px]">
      {/* Formulário de Pesquisa */}
        <div className="w-full pl-[40px] pr-[40px]">
          <form action="" onSubmit={e => e.preventDefault()}>
            <input type="text" placeholder="Pesquisar" className="w-full h-[40px] rounded-[10px] border-none outline-none px-[10px] bg-[#E3DBFC]" value={search} onChange={e => setSearch(e.target.value)} />
          </form>
        </div>
        
        <CardGrid className="mt-[20px]">
          {filteredFandoms.length > 0 ? (
            filteredFandoms.map((fandom) => (
              <FamdomCard key={fandom.id} fandom={fandom} />
            ))
          ) : (
            <div className="w-full text-center text-white text-[18px] mt-[40px]">
              Nenhuma fandom encontrada. Seja o primeiro a criar uma!
            </div>
          )}
        </CardGrid>
      </div>

    </main>
  );
}
