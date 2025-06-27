'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import CharacterCard from "@/components/ui/CharacterCard";
import FandomHeader from "@/components/ui/FandomHeader";
import { CardGrid } from "@/components/templates";

// Interfaces para os dados
interface Fandom {
  id: string;
  name: string;
  description: string;
  image_url: string;
  creator_id: string;
}

interface FandomPage {
  id: string;
  fandom_id: string;
  page_title: string;
  page_description: string;
  background_color: string;
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

/**
 * Página dedicada para exibir todos os personagens da fandom
 * 
 * Esta página:
 * - Carrega todos os personagens da fandom
 * - Exibe em layout responsivo
 * - Permite navegação de volta para a página principal
 * - Mostra estatísticas dos personagens
 */
export default function CharactersPage() {
  const params = useParams();
  const fandomId = params.id as string;

  // Estados para gerenciar dados
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [characters, setCharacters] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook que executa quando o componente é montado
  const loadCharacters = useCallback(async () => {
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

      // Carrega a seção de personagens
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('id')
        .eq('fandom_page_id', pageData.id)
        .eq('section_title', 'Personagens')
        .eq('is_active', true)
        .single();

      if (sectionsError) {
        console.error('Erro ao carregar seção de personagens:', sectionsError);
        setCharacters([]);
        return;
      }

      // Carrega todos os personagens da seção
      const { data: charactersData, error: charactersError } = await supabase
        .from('section_items')
        .select('*')
        .eq('section_id', sectionsData.id)
        .eq('item_type', 'character')
        .eq('is_active', true)
        .order('item_order');

      if (charactersError) {
        console.error('Erro ao carregar personagens:', charactersError);
        setCharacters([]);
        return;
      }

      setCharacters(charactersData || []);

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [fandomId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

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

      {/* Conteúdo da página */}
      <main>
        {/* Seções */}
        <div className="pl-[150px] pr-[150px]">
          {/* Seção de Personagens */}
          <div className="">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[50px] text-white font-bold">Todos os Personagens</p>
            </div>
            
            {/* Cards usando CardGrid */}
            <div>
              {/* Grid de Personagens */}
              <CardGrid className="gap-[20px]">
                {characters.length > 0 ? (
                  characters.map((character) => (
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
            
            {/* Botão de voltar para página principal */}
            <div className="flex justify-center">
              <Link
                href={`/fandom/${fandomId}`}
                className="bg-red-500 p-[10px] rounded-[10px] text-white hover:bg-red-600 transition-colors mt-[15px]"
              >
                Voltar para Página Principal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 