'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FandomHeader from "@/components/ui/FandomHeader";
import { HeroSection, CardGrid } from "@/components/templates";
import CharacterCard from "@/components/ui/CharacterCard";

// Interfaces para os dados da página
interface FandomPage {
  id: string;
  fandom_id: string;
  page_title: string;
  page_description: string;
  hero_title: string;
  hero_description: string;
  hero_primary_button_text: string;
  hero_secondary_button_text: string;
  hero_primary_button_color: string;
  hero_secondary_button_color: string;
  background_color: string;
}

interface FandomSection {
  id: string;
  section_type: string;
  section_title: string;
  section_description: string;
  section_order: number;
  is_active: boolean;
  custom_content: string;
}

interface SectionItem {
  id: string;
  section_id: string;
  item_type: string;
  item_title: string;
  item_description: string;
  item_image_url: string;
  item_color: string;
  item_order: number;
  is_active: boolean;
  custom_data?: {
    categories?: string[];
    [key: string]: unknown;
  };
}

interface Fandom {
  id: string;
  name: string;
  description: string;
  image_url: string;
  creator_id: string;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Página dinâmica da fandom
 * 
 * Esta página:
 * - Carrega dados da fandom e sua página personalizada
 * - Renderiza seções baseadas nos templates
 * - Permite customização de cores e conteúdo
 * - É acessível publicamente
 * - Exibe personagens usando CharacterCard
 * - Layout totalmente responsivo
 */
export default function FandomPage() {
  const params = useParams();
  const router = useRouter();
  const fandomId = params.id as string;

  // Estados para gerenciar dados da página
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [sections, setSections] = useState<FandomSection[]>([]);
  const [items, setItems] = useState<{ [sectionId: string]: SectionItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para categorias e filtros
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Todos', isActive: true }
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredCharacters, setFilteredCharacters] = useState<SectionItem[]>([]);

  // Função para carregar filtros do banco de dados
  const loadFilters = useCallback(async () => {
    try {
      console.log('loadFilters chamada - fandomPage:', fandomPage?.id);
      if (!fandomPage) return;

      // Carregar seção de personagens
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', fandomPage.id)
        .eq('section_title', 'Personagens')
        .single();

      if (sectionsError) {
        console.error('Erro ao carregar seção de personagens:', sectionsError);
        return;
      }

      // Carregar filtros
      const { data: filtersData, error: filtersError } = await supabase
        .from('section_filters')
        .select('*')
        .eq('section_id', sectionsData.id)
        .eq('is_active', true)
        .order('filter_order');

      if (filtersError) {
        console.error('Erro ao carregar filtros:', filtersError);
        return;
      }

      console.log('Filtros carregados do banco:', filtersData);

      // Converter filtros do banco para o formato da interface
      const dbCategories: Category[] = [];

      // Adiciona filtros do banco de dados (excluindo qualquer filtro com valor 'all')
      filtersData?.forEach(filter => {
        if (filter.filter_value !== 'all') {
          dbCategories.push({
            id: filter.filter_value,
            name: filter.filter_label,
            isActive: false
          });
        }
      });

      console.log('Categorias do banco processadas:', dbCategories);

      // Cria array final com "Todos" + filtros do banco
      const finalCategories: Category[] = [
        { id: 'all', name: 'Todos', isActive: true },
        ...dbCategories
      ];

      console.log('Categorias finais:', finalCategories);

      // Atualiza as categorias
      setCategories(finalCategories);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  }, [fandomPage]);

  // Carregar filtros quando a página carregar
  useEffect(() => {
    if (fandomPage) {
      loadFilters();
    }
  }, [fandomPage]);

  // Função para filtrar personagens por categoria
  const filterCharactersByCategory = useCallback((categoryId: string) => {
    // Busca personagens na seção de personagens
    const charactersSection = sections.find(section => section.section_title === 'Personagens');
    const allCharacters = charactersSection ? items[charactersSection.id] || [] : [];
    
    if (categoryId === 'all') {
      // Mostra todos os personagens (máximo 8)
      setFilteredCharacters(allCharacters.slice(0, 8));
    } else {
      // Filtra por categoria específica
      const filtered = allCharacters.filter(character => 
        character.custom_data?.categories?.includes(categoryId)
      ).slice(0, 8); // Máximo 8 personagens
      setFilteredCharacters(filtered);
    }
  }, [sections, items]);

  // Função para mudar categoria ativa
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Atualiza estado das categorias
    setCategories(prev => prev.map(cat => ({
      ...cat,
      isActive: cat.id === categoryId
    })));
    
    // Filtra personagens
    filterCharactersByCategory(categoryId);
  };

  // Função para ir para página de personagens
  const handleViewMoreCharacters = () => {
    router.push(`/fandom/${fandomId}/characters`);
  };

  // Inicializa personagens filtrados quando o componente carrega
  useEffect(() => {
    filterCharactersByCategory(selectedCategory);
  }, [filterCharactersByCategory, selectedCategory]);

  // Hook que executa quando o componente é montado
  const loadPageData = useCallback(async () => {
    try {
      // Carrega dados da fandom
      const { data: fandomData, error: fandomError } = await supabase
        .from('fandoms')
        .select('*')
        .eq('id', fandomId)
        .single();

      if (fandomError) {
        throw new Error('Fandom não encontrada');
      }

      setFandom(fandomData);

      // Carrega dados da página personalizada
      const { data: pageData, error: pageError } = await supabase
        .from('fandom_pages')
        .select('*')
        .eq('fandom_id', fandomId)
        .single();

      if (pageError) {
        throw new Error('Página da fandom não encontrada');
      }

      setFandomPage(pageData);

      // Carrega seções da página
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', pageData.id)
        .eq('is_active', true)
        .order('section_order');

      if (sectionsError) {
        console.error('Erro ao carregar seções:', sectionsError);
      } else {
        setSections(sectionsData || []);

        // Carrega itens da seção
        const itemsData: { [sectionId: string]: SectionItem[] } = {};

        for (const section of sectionsData || []) {
          // Carrega itens da seção
          const { data: items, error: itemsError } = await supabase
            .from('section_items')
            .select('*')
            .eq('section_id', section.id)
            .eq('is_active', true)
            .order('item_order');

          if (!itemsError) {
            itemsData[section.id] = items || [];
          }
        }

        setItems(itemsData);
      }

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [fandomId]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  /**
   * Renderiza uma seção baseada no seu tipo
   */
  // const renderSection = (section: FandomSection) => {
  //   const sectionFilters = filters[section.id] || [];
  //   const sectionItems = items[section.id] || [];

  //   switch (section.section_type) {
  //     case 'hero':
  //       return (
  //         <HeroSection
  //           key={section.id}
  //           title={fandomPage?.hero_title || "Bem-vindo"}
  //           description={fandomPage?.hero_description || ""}
  //           primaryButtonText={fandomPage?.hero_primary_button_text || "Explorar"}
  //           secondaryButtonText={fandomPage?.hero_secondary_button_text || "Saiba Mais"}
  //           onPrimaryClick={() => console.log("Botão primário clicado")}
  //           onSecondaryClick={() => console.log("Botão secundário clicado")}
  //         />
  //       );

  //     case 'filter':
  //       return (
  //         <PageSection key={section.id}>
  //           <FilterSection
  //             title={section.section_title || "Seção"}
  //             description={section.section_description || ""}
  //             filters={sectionFilters.map(filter => ({
  //               id: filter.id,
  //               label: filter.filter_label,
  //               isActive: filter.is_active
  //             }))}
  //             onFilterChange={(filterId: string) => console.log("Filtro alterado:", filterId)}
  //             showLoadMore={true}
  //             loadMoreText={`Ver mais ${section.section_title}`}
  //             onLoadMore={() => {
  //               if (section.section_title === 'Personagens') {
  //                 router.push(`/fandom/${fandomId}/characters`);
  //               } else {
  //                 console.log("Ver mais");
  //               }
  //             }}
  //           />
            
  //           {/* Renderiza personagens se for seção de personagens */}
  //           {section.section_title === 'Personagens' && sectionItems.length > 0 && (
  //             <div className="pl-[150px] pr-[150px]">
  //               <p className="text-[50px] text-white font-bold mb-6">Personagens</p>
  //               <div className="bg-red-500 w-full h-fit flex overflow-x-auto">
  //                 <div className="flex gap-[20px] min-w-max">
  //                   {sectionItems.map(item => (
  //                     <CharacterCard
  //                       key={item.id}
  //                       id={item.id}
  //                       title={item.item_title}
  //                       description={item.item_description}
  //                       image_url={item.item_image_url}
  //                       color={item.item_color}
  //                       fandomId={fandomId}
  //                     />
  //                   ))}
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {/* Renderiza outros itens como cards genéricos */}
  //           {section.section_title !== 'Personagens' && sectionItems.length > 0 && (
  //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
  //               {sectionItems.map(item => (
  //                 <div
  //                   key={item.id}
  //                   className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
  //                   style={{ borderColor: item.item_color }}
  //                 >
  //                   <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{item.item_title}</h3>
  //                   <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">{item.item_description}</p>
  //                   {item.item_image_url && (
  //                     <div className="mt-3">
  //                       <Image 
  //                         src={item.item_image_url} 
  //                         alt={item.item_title}
  //                         width={400}
  //                         height={128}
  //                         className="w-full h-24 sm:h-32 object-cover rounded"
  //                       />
  //                     </div>
  //                   )}
  //                 </div>
  //               ))}
  //             </div>
  //           )}
  //         </PageSection>
  //       );

  //     default:
  //       return (
  //         <PageSection key={section.id}>
  //           <div className="text-center py-8 px-4">
  //             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{section.section_title}</h2>
  //             <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{section.section_description}</p>
  //           </div>
  //         </PageSection>
  //       );
  //   }
  // };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#926DF6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">Erro</h1>
          <p className="text-sm sm:text-base text-red-700 mb-4">{error}</p>
          <Link
            href="/"
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  if (!fandom || !fandomPage) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Página não encontrada</h1>
          <p className="text-sm sm:text-base text-yellow-700 mb-4">Esta fandom não possui uma página personalizada.</p>
          <Link
            href="/"
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#875CF5]">
      {/* Header com dados reais da fandom */}
      <FandomHeader
        fandomName={fandom.name}
        fandomDescription={fandom.description}
        fandomId={fandom.id}
        creatorId={fandom.creator_id}
      />

      {/* Aqui você pode montar seu design */}
      <main>
          <HeroSection 
            title={fandomPage.hero_title || "Bem-vindo à Fandom"}
            description={fandomPage.hero_description || "Descrição da sua fandom incrível"}
            primaryButtonText={fandomPage.hero_primary_button_text || "Explorar"}
            secondaryButtonText={fandomPage.hero_secondary_button_text || "Saiba Mais"}
            onPrimaryClick={() => console.log("Botão primário clicado")}
            onSecondaryClick={() => console.log("Botão secundário clicado")}
          />
          {/* Seções */}
          <div className="pl-[150px] pr-[150px]">
            {/* Seção de Personagem */}
            <div className="">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[50px] text-white font-bold">Personagens</p>
                <Link
                  href={`/fandom/${fandomId}/manage-filters`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Gerenciar Filtros
                </Link>
              </div>
              {/* Cards usando CardGrid e Carrossel */}
              <div>
                {/* Carrossel de Categorias */}
                <div className="bg-blue-500 p-[5px] rounded-[10px] w-fit max-w-full mt-[15px] overflow-hidden mb-[15px]">
                  <div className="flex text-[15px] overflow-x-auto gap-[10px]">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`pt-[10px] pb-[10px] pl-[20px] pr-[20px] rounded-[10px] transition-all duration-250 whitespace-nowrap ${
                          category.isActive 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Grid de Personagens Filtrados */}
                <CardGrid className="gap-[20px]">
                  {filteredCharacters.length > 0 ? (
                    filteredCharacters.map((character) => (
                      <CharacterCard
                        key={character.id}
                        id={character.id}
                        title={character.item_title}
                        description={character.item_description}
                        image_url={character.item_image_url}
                        color={character.item_color}
                        fandomId={fandomId}
                      />
                    ))
                  ) : (
                    // Cards de exemplo quando não há dados reais
                    <>
                      <CharacterCard
                        id="1"
                        title="Personagem 1"
                        description="Descrição do personagem 1"
                        color="#926DF6"
                      />
                      <CharacterCard
                        id="2"
                        title="Personagem 2"
                        description="Descrição do personagem 2"
                        color="#926DF6"
                      />
                      <CharacterCard
                        id="3"
                        title="Personagem 3"
                        description="Descrição do personagem 3"
                        color="#926DF6"
                      />
                      <CharacterCard
                        id="4"
                        title="Personagem 4"
                        description="Descrição do personagem 4"
                        color="#926DF6"
                      />
                    </>
                  )}
                </CardGrid>
              </div>
              <div className="flex justify-center">
                <button 
                  className="bg-red-500 p-[10px] rounded-[10px] text-white hover:bg-red-600 transition-colors mt-[15px]"
                  onClick={handleViewMoreCharacters}
                >
                  Ver mais personagens
                </button>
              </div>
            </div>
            {/* Seção de Regiões */}
            <div>
              <p className="text-[50px] text-white font-bold ">Regiões</p>
              {/* Vou montar o resto no futuro */}
            </div>
          </div>
      </main>
    </div>
  );
} 