'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import CharacterCard from "@/components/ui/CharacterCard";
import { User } from "@supabase/supabase-js";
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
  const [user, setUser] = useState<User | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [characters, setCharacters] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook que executa quando o componente é montado
  const loadCharacters = useCallback(async () => {
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
    <div 
      className="min-h-screen"
      style={{ backgroundColor: fandomPage.background_color }}
    >
      {/* Header com estilo do Header.tsx global */}
      <FandomHeader
        fandomName={fandom.name}
        fandomDescription={fandom.description}
        fandomId={fandomId}
        creatorId={fandom.creator_id}
      />

      {/* Conteúdo da página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navegação e título */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href={`/fandom/${fandomId}`}
              className="text-[#926DF6] hover:text-[#A98AF8] transition-colors text-sm sm:text-base flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para {fandom.name}
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Personagens de {fandom.name}
          </h1>
          <p className="text-white opacity-90 text-sm sm:text-base mt-2">
            Conheça todos os personagens desta fandom incrível
          </p>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Estatísticas dos Personagens
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Total de {characters.length} personagem{characters.length !== 1 ? 's' : ''} nesta fandom
              </p>
            </div>
            
            <div className="flex gap-4 text-center">
              <div className="bg-[#926DF6] text-white px-4 py-2 rounded-lg">
                <div className="text-lg sm:text-xl font-bold">{characters.length}</div>
                <div className="text-xs sm:text-sm">Personagens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de personagens */}
        {characters.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Todos os Personagens
              </h2>
              <p className="text-white opacity-90 text-sm sm:text-base">
                Clique em um personagem para ver mais detalhes
              </p>
            </div>

            <CardGrid className="gap-4 md:gap-6 lg:gap-8">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  id={character.id}
                  title={character.item_title}
                  description={character.item_description}
                  image_url={character.item_image_url}
                  color={character.item_color}
                  fandomId={fandomId}
                />
              ))}
            </CardGrid>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                Nenhum personagem encontrado
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Esta fandom ainda não possui personagens cadastrados.
              </p>
              {user?.id === fandom?.creator_id && (
                <Link
                  href={`/fandom/${fandomId}/edit`}
                  className="bg-[#926DF6] text-white px-4 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
                >
                  Adicionar Primeiro Personagem
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 