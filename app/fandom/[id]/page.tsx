'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HeroSection, FilterSection, PageSection } from "@/components/templates";
import CharacterCard from "@/components/ui/CharacterCard";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

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

interface SectionFilter {
  id: string;
  section_id: string;
  filter_label: string;
  filter_value: string;
  is_active: boolean;
  filter_order: number;
  filter_color: string;
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
}

interface Fandom {
  id: string;
  name: string;
  description: string;
  image_url: string;
  creator_id: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [sections, setSections] = useState<FandomSection[]>([]);
  const [filters, setFilters] = useState<{ [sectionId: string]: SectionFilter[] }>({});
  const [items, setItems] = useState<{ [sectionId: string]: SectionItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook que executa quando o componente é montado
  const loadPageData = useCallback(async () => {
    try {
      // Verifica se o usuário está logado (opcional)
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

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

        // Carrega filtros e itens para cada seção
        const filtersData: { [sectionId: string]: SectionFilter[] } = {};
        const itemsData: { [sectionId: string]: SectionItem[] } = {};

        for (const section of sectionsData || []) {
          // Carrega filtros da seção
          const { data: filters, error: filtersError } = await supabase
            .from('section_filters')
            .select('*')
            .eq('section_id', section.id)
            .order('filter_order');

          if (!filtersError) {
            filtersData[section.id] = filters || [];
          }

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

        setFilters(filtersData);
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
  const renderSection = (section: FandomSection) => {
    const sectionFilters = filters[section.id] || [];
    const sectionItems = items[section.id] || [];

    switch (section.section_type) {
      case 'hero':
        return (
          <HeroSection
            key={section.id}
            title={fandomPage?.hero_title || "Bem-vindo"}
            description={fandomPage?.hero_description || ""}
            primaryButtonText={fandomPage?.hero_primary_button_text || "Explorar"}
            secondaryButtonText={fandomPage?.hero_secondary_button_text || "Saiba Mais"}
            onPrimaryClick={() => console.log("Botão primário clicado")}
            onSecondaryClick={() => console.log("Botão secundário clicado")}
          />
        );

      case 'filter':
        return (
          <PageSection key={section.id}>
            <FilterSection
              title={section.section_title || "Seção"}
              description={section.section_description || ""}
              filters={sectionFilters.map(filter => ({
                id: filter.id,
                label: filter.filter_label,
                isActive: filter.is_active
              }))}
              onFilterChange={(filterId) => console.log("Filtro alterado:", filterId)}
              showLoadMore={true}
              loadMoreText={`Ver mais ${section.section_title}`}
              onLoadMore={() => {
                if (section.section_title === 'Personagens') {
                  router.push(`/fandom/${fandomId}/characters`);
                } else {
                  console.log("Ver mais");
                }
              }}
            />
            
            {/* Renderiza personagens se for seção de personagens */}
            {section.section_title === 'Personagens' && sectionItems.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {sectionItems.map(item => (
                    <div key={item.id} className="flex justify-center">
                      <CharacterCard
                        id={item.id}
                        title={item.item_title}
                        description={item.item_description}
                        image_url={item.item_image_url}
                        color={item.item_color}
                        fandomId={fandomId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Renderiza outros itens como cards genéricos */}
            {section.section_title !== 'Personagens' && sectionItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
                {sectionItems.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    style={{ borderColor: item.item_color }}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{item.item_title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">{item.item_description}</p>
                    {item.item_image_url && (
                      <div className="mt-3">
                        <Image 
                          src={item.item_image_url} 
                          alt={item.item_title}
                          width={400}
                          height={128}
                          className="w-full h-24 sm:h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PageSection>
        );

      default:
        return (
          <PageSection key={section.id}>
            <div className="text-center py-8 px-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{section.section_title}</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{section.section_description}</p>
            </div>
          </PageSection>
        );
    }
  };

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
    <div 
      className="min-h-screen"
      style={{ backgroundColor: fandomPage.background_color }}
    >
      {/* Header com botão de edição para o criador */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{fandom.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">{fandom.description}</p>
            </div>
            
            {user?.id === fandom.creator_id && (
              <Link
                href={`/fandom/${fandomId}/edit`}
                className="bg-[#926DF6] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
              >
                Editar Página
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8 sm:space-y-12">
          {sections.map(section => renderSection(section))}
        </div>
      </div>
    </div>
  );
} 