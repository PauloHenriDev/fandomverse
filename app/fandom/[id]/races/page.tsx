'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FandomHeader from "@/components/ui/FandomHeader";
import { CardGrid } from "@/components/templates";
import RaceCard from "@/components/ui/RaceCard";
import AddRaceModal from "@/components/ui/AddRaceModal";

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
 * Página de Raças/Espécies da fandom
 * 
 * Esta página:
 * - Carrega dados da fandom e sua página personalizada
 * - Renderiza seções de raças baseadas nos templates
 * - Permite customização de cores e conteúdo
 * - É acessível publicamente
 * - Exibe raças usando RaceCard
 * - Layout totalmente responsivo
 */
export default function RacesPage() {
  const params = useParams();
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
  const [filteredRaces, setFilteredRaces] = useState<SectionItem[]>([]);

  // Estados para o modal de adicionar raça
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Função para carregar filtros do banco de dados
  const loadFilters = useCallback(async () => {
    try {
      console.log('loadFilters chamada - fandomPage:', fandomPage?.id);
      if (!fandomPage) return;

      // Carregar seção de raças
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', fandomPage.id)
        .eq('section_title', 'Raças/Espécies')
        .single();

      if (sectionsError) {
        console.error('Erro ao carregar seção de raças:', sectionsError);
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
    loadFilters();
  }, [loadFilters]);

  // Função para filtrar raças por categoria
  const filterRacesByCategory = useCallback((categoryId: string) => {
    // Busca raças na seção de raças
    const racesSection = sections.find(section => section.section_title === 'Raças/Espécies');
    const allRaces = racesSection ? items[racesSection.id] || [] : [];
    
    if (categoryId === 'all') {
      // Mostra todas as raças
      setFilteredRaces(allRaces);
    } else {
      // Filtra por categoria específica
      const filtered = allRaces.filter(race => 
        race.custom_data?.categories?.includes(categoryId)
      );
      setFilteredRaces(filtered);
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
    
    // Filtra raças
    filterRacesByCategory(categoryId);
  };

  // Inicializa raças filtradas quando o componente carrega
  useEffect(() => {
    filterRacesByCategory(selectedCategory);
  }, [filterRacesByCategory, selectedCategory]);

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

      {/* Conteúdo principal */}
      <main>
        <div className="pl-[150px] pr-[150px]">
          {/* Seção de Raças/Espécies */}
          <div className="">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[50px] text-white font-bold">Raças/Espécies</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Adicionar Raça
                </button>
                <Link
                  href={`/fandom/${fandomId}/manage-filters`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Gerenciar Filtros
                </Link>
              </div>
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
              
              {/* Grid de Raças Filtradas */}
              <CardGrid className="gap-[20px]">
                {filteredRaces.length > 0 ? (
                  filteredRaces.map((race) => (
                    <RaceCard
                      key={race.id}
                      id={race.id}
                      title={race.item_title}
                      description={race.item_description}
                      image_url={race.item_image_url}
                      color={race.item_color}
                      fandomId={fandomId}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-white text-xl mb-4">Nenhuma raça criada ainda</p>
                    <p className="text-white/70 text-lg mb-6">Comece criando sua primeira raça!</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
                    >
                      Criar Primeira Raça
                    </button>
                  </div>
                )}
              </CardGrid>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para adicionar nova raça */}
      <AddRaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRaceAdded={() => {
          // Recarregar dados das raças
          loadPageData();
        }}
        fandomId={fandomId}
        sectionId={sections.find(section => section.section_title === 'Raças/Espécies')?.id || ''}
      />
    </div>
  );
} 