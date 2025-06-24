'use client';

import Header from "@/components/ui/Header";
// import CharacterCard from "@/components/ui/CharacterCard";
// import { HeroSection, FilterSection, CardGrid, PageSection } from "@/components/templates";
import { HeroSection } from "@/components/templates";


export default function Home() {
  // Dados de exemplo para os filtros
  // const characterFilters = [
  //   { id: "all", label: "Todos", isActive: true },
  //   { id: "protagonists", label: "Protagonistas" },
  //   { id: "antagonists", label: "Antagonistas" },
  //   { id: "supporting", label: "Secundários" },
  //   { id: "villains", label: "Vilões" },
  //   { id: "heroes", label: "Heróis" },
  // ];

  // const regionFilters = [
  //   { id: "all", label: "Todas", isActive: true },
  //   { id: "north", label: "Norte" },
  //   { id: "south", label: "Sul" },
  //   { id: "east", label: "Leste" },
  //   { id: "west", label: "Oeste" },
  //   { id: "center", label: "Centro" },
  // ];

  return (
    <main className="bg-[#875CF5]">
      <Header />
      <HeroSection 
        title="Nome da Fandom"
        description="Breve Descrição"
        primaryButtonText="Explorar Conteúdo"
        secondaryButtonText="Entrar na Comunidade"
        onPrimaryClick={() => console.log("Explorar clicado")}
        onSecondaryClick={() => console.log("Comunidade clicado")}
      />



      
      {/* <div className="flex flex-col items-center mt-[20px]">
        <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
        <p className="text-[20px] text-[#E3DBFC] mt-[10px]">Explore comunidades dedicadas aos seus universos favoritos. Conecte-se com outros fãs, compartilhe teorias e celebre suas paixões.</p>
      </div>
      <div className="flex flex-col items-center pl-[150px] pr-[150px] mt-[20px]">
        <p>search bar</p>
        <div className="flex flex-wrap gap-[20px]">
          <FamdomCard />
        </div>
      </div> */}


      {/* Hero Section */}
      {/* <HeroSection
        title="Nome da Fandom"
        description="Breve Descrição"
        primaryButtonText="Explorar Conteúdo"
        secondaryButtonText="Entrar na Comunidade"
        onPrimaryClick={() => console.log("Explorar clicado")}
        onSecondaryClick={() => console.log("Comunidade clicado")}
      /> */}

      {/* Sessão de Personagens */}
      {/* <PageSection>
        <FilterSection
          title="Personagens"
          description="Descrição da Sessão de Personagens"
          filters={characterFilters}
          onFilterChange={(filterId) => console.log("Filtro alterado:", filterId)}
          showLoadMore={true}
          loadMoreText="Ver mais Personagens"
          onLoadMore={() => console.log("Ver mais personagens")}
        />

        <CardGrid>
          <CharacterCard />
          <CharacterCard />
          <CharacterCard />
          <CharacterCard />
        </CardGrid>
      </PageSection> */}

      {/* Sessão de Regiões */}
      {/* <PageSection>
        <FilterSection
          title="Regiões"
          description="Descrição da Sessão de Regiões"
          filters={regionFilters}
          onFilterChange={(filterId) => console.log("Filtro região alterado:", filterId)}
        />
      </PageSection> */}
    </main>
  );
}
