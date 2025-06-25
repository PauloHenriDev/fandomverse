'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HeroSection, FilterSection, CardGrid, PageSection } from "@/components/templates";
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
  filter_label: string;
  filter_value: string;
  is_active: boolean;
  filter_order: number;
  filter_color: string;
}

interface SectionItem {
  id: string;
  item_type: string;
  item_title: string;
  item_description: string;
  item_image_url: string;
  item_color: string;
  item_order: number;
  is_active: boolean;
  custom_data: Record<string, unknown>;
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
 */
export default function FandomPage() {
  const params = useParams();
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

  /**
   * Carrega todos os dados da página da fandom
   */
  const loadFandomPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o usuário está logado
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

      // Carrega dados da página da fandom
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
        await loadSectionData(sectionsData || []);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar página da fandom:', error);
    } finally {
      setLoading(false);
    }
  }, [fandomId]);

  // Hook que executa quando o componente é montado
  useEffect(() => {
    if (fandomId) {
      loadFandomPage();
    }
  }, [fandomId, loadFandomPage]);

  /**
   * Carrega filtros e itens para cada seção
   */
  const loadSectionData = async (sectionsData: FandomSection[]) => {
    const filtersData: { [sectionId: string]: SectionFilter[] } = {};
    const itemsData: { [sectionId: string]: SectionItem[] } = {};

    for (const section of sectionsData) {
      // Carrega filtros da seção
      const { data: sectionFilters } = await supabase
        .from('section_filters')
        .select('*')
        .eq('section_id', section.id)
        .order('filter_order');

      if (sectionFilters) {
        filtersData[section.id] = sectionFilters;
      }

      // Carrega itens da seção
      const { data: sectionItems } = await supabase
        .from('section_items')
        .select('*')
        .eq('section_id', section.id)
        .eq('is_active', true)
        .order('item_order');

      if (sectionItems) {
        itemsData[section.id] = sectionItems;
      }
    }

    setFilters(filtersData);
    setItems(itemsData);
  };

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
            title={fandomPage?.hero_title || section.section_title || "Bem-vindo"}
            description={fandomPage?.hero_description || section.section_description || ""}
            primaryButtonText={fandomPage?.hero_primary_button_text || "Explorar"}
            secondaryButtonText={fandomPage?.hero_secondary_button_text || "Comunidade"}
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
              onLoadMore={() => console.log("Ver mais")}
            />
            
            {sectionItems.length > 0 && (
              <CardGrid>
                {sectionItems.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ borderColor: item.item_color }}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{item.item_title}</h3>
                    <p className="text-gray-600 text-sm">{item.item_description}</p>
                    {item.item_image_url && (
                      <Image 
                        src={item.item_image_url} 
                        alt={item.item_title}
                        width={400}
                        height={128}
                        className="w-full h-32 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))}
              </CardGrid>
            )}
          </PageSection>
        );

      case 'card_grid':
        return (
          <PageSection key={section.id}>
            <div>
              <h2 className="text-[40px] font-bold">{section.section_title}</h2>
              <p className="text-[20px] mt-[10px]">{section.section_description}</p>
            </div>
            
            <CardGrid>
              {sectionItems.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: item.item_color }}
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{item.item_title}</h3>
                  <p className="text-gray-600 text-sm">{item.item_description}</p>
                  {item.item_image_url && (
                    <Image 
                      src={item.item_image_url} 
                      alt={item.item_title}
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              ))}
            </CardGrid>
          </PageSection>
        );

      case 'custom':
        return (
          <PageSection key={section.id}>
            <div>
              <h2 className="text-[40px] font-bold">{section.section_title}</h2>
              <p className="text-[20px] mt-[10px]">{section.section_description}</p>
            </div>
            
            <div 
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: section.custom_content || "" }}
            />
          </PageSection>
        );

      default:
        return null;
    }
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#926DF6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erro</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/"
            className="bg-[#926DF6] text-white px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  if (!fandom || !fandomPage) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">Página não encontrada</h1>
          <p className="text-yellow-700 mb-4">Esta fandom não possui uma página personalizada.</p>
          <Link
            href="/"
            className="bg-[#926DF6] text-white px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: fandomPage.background_color }}>
      {/* Header simples */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-[#926DF6] hover:text-[#A98AF8] transition-colors">
              ← Voltar para Home
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">{fandom.name}</h1>
            {/* Botão de editar - só aparece para o criador */}
            {user && user.id === fandom.creator_id && (
              <Link
                href={`/fandom/${fandomId}/edit`}
                className="bg-[#926DF6] text-white px-4 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Página
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Renderiza todas as seções em ordem */}
      {sections.map(section => renderSection(section))}

      {/* Footer simples */}
      <div className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 {fandom.name} - Página personalizada</p>
          </div>
        </div>
      </div>
    </main>
  );
} 