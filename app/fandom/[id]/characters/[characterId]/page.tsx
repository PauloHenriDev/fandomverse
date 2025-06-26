'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

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

interface Character {
  id: string;
  section_id: string;
  item_type: string;
  item_title: string;
  item_description: string;
  item_image_url: string;
  item_color: string;
  item_order: number;
  is_active: boolean;
  custom_data?: Record<string, string>;
}

/**
 * Página dedicada para exibir um personagem específico
 * 
 * Layout inspirado no design fornecido:
 * - Sidebar com informações básicas
 * - Conteúdo principal com seções
 * - Design responsivo e moderno
 */
export default function CharacterPage() {
  const params = useParams();
  const fandomId = params.id as string;
  const characterId = params.characterId as string;

  // Estados para gerenciar dados
  const [user, setUser] = useState<User | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [characterData, setCharacterData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook que executa quando o componente é montado
  const loadCharacter = useCallback(async () => {
    try {
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

      // Carrega dados do personagem específico
      const { data: characterData, error: characterError } = await supabase
        .from('section_items')
        .select('*')
        .eq('id', characterId)
        .eq('item_type', 'character')
        .eq('is_active', true)
        .single();

      if (characterError) {
        throw new Error('Personagem não encontrado');
      }

      setCharacter(characterData);

      // Extrai dados customizados
      const customData = characterData.custom_data || {};
      setCharacterData(customData);

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [fandomId, characterId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  // Função para renderizar blocos de informação
  const infoBlock = (title: string, items: { label: string; value: string }[]) => (
    <div className="p-[15px]">
      <h3 className="text-[18px] font-bold mb-[10px] text-center">{title}</h3>
      <div className="flex flex-col gap-[8px]">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-[14px]">
            <span className="font-medium">{item.label}</span>
            <span className="text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

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
            href={`/fandom/${fandomId}`}
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para {fandom?.name || 'Fandom'}
          </Link>
        </div>
      </div>
    );
  }

  if (!fandom || !fandomPage || !character) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Página não encontrada</h1>
          <p className="text-sm sm:text-base text-yellow-700 mb-4">Este personagem não foi encontrado.</p>
          <Link
            href={`/fandom/${fandomId}`}
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para {fandom?.name || 'Fandom'}
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  href={`/fandom/${fandomId}/characters`}
                  className="text-[#926DF6] hover:text-[#A98AF8] transition-colors text-sm sm:text-base"
                >
                  ← Voltar para Personagens
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {character.item_title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Personagem de {fandom.name}
              </p>
            </div>
            
            {user?.id === fandom.creator_id && (
              <Link
                href={`/fandom/${fandomId}/characters/${characterId}/edit`}
                className="bg-[#926DF6] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
              >
                Editar Personagem
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Layout com Sidebar */}
      <main className="flex flex-col sm:flex-row flex-wrap w-full transition-colors duration-300">
        
        {/* Sidebar */}
        <div className="w-full sm:w-1/2 lg:w-1/5 p-[20px]">
          <div 
            className="border-[3px] rounded-t-[24px] rounded-b-[10px] bg-white shadow-lg"
            style={{ borderColor: character.item_color }}
          >
            {/* Título */}
            <div 
              className="flex h-[40px] justify-center items-center rounded-t-[20px] border-b border-gray-300"
              style={{ backgroundColor: character.item_color }}
            >
              <p className="text-[25px] font-bold text-white">{character.item_title}</p>
            </div>
            
            {/* Imagem */}
            <div className="flex h-[250px] justify-center items-center overflow-hidden">
              {character.item_image_url ? (
                <Image
                  src={character.item_image_url}
                  alt={`Imagem de ${character.item_title}`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div 
                  className="flex items-center justify-center w-full h-full"
                  style={{ backgroundColor: character.item_color }}
                >
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <p className="text-sm">Sem Imagem</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Informações */}
            <div className="flex flex-col gap-[8px]">
              {infoBlock("Informações", [
                { label: "Nome:", value: character.item_title },
                { label: "Fandom:", value: fandom.name },
                { label: "Tipo:", value: "Personagem" },
                { label: "Status:", value: character.is_active ? "Ativo" : "Inativo" },
              ])}

              {infoBlock("Aparência", [
                { label: "Cor do Card:", value: character.item_color },
                { label: "Ordem:", value: character.item_order.toString() },
              ])}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex w-full sm:w-1/2 lg:w-4/5 p-[20px] justify-center">
          <div className="flex flex-col rounded-[10px] bg-white w-[80%] p-[20px] gap-[40px] shadow-lg relative">
            
            {/* Botão de Edição (Engrenagem) */}
            {user?.id === fandom.creator_id && (
              <div className="absolute top-4 right-4 z-10">
                <Link
                  href={`/fandom/${fandomId}/characters/${characterId}/edit`}
                  className="bg-[#926DF6] text-white p-3 rounded-full hover:bg-[#A98AF8] transition-colors shadow-lg hover:shadow-xl"
                  title="Editar Ficha do Personagem"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
            )}
            
            {/* Nome do Personagem */}
            <div className="flex flex-col gap-[20px]">
              <h1 className="text-[40px] font-bold text-gray-800">{character.item_title}</h1>
            </div>

            {/* Descrição */}
            <div className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px]">
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Descrição</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {character.item_description}
              </div>
            </div>

            {/* Quote (Citação) */}
            <div className="flex flex-col w-full md:w-[60%] p-[20px] bg-gray-50 border-l-[5px] border-[#3E526E] gap-[10px] italic text-gray-700">
              <p>&ldquo;{characterData.quote || 'Aqui você pode adicionar uma citação marcante do personagem.'}&rdquo;</p>
              <div className="flex justify-end">
                <p>— {characterData.quoteSource || character.item_title}</p>
              </div>
            </div>

            {/* Navegação das Seções */}
            <div className="flex gap-[10px] border-b-[1px] border-[#3E526E] flex-wrap">
              <a
                href="#personalidade"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Personalidade
              </a>
              <a
                href="#aparencia"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Aparência
              </a>
              <a
                href="#habilidades"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Habilidades
              </a>
              <a
                href="#equipamentos"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Equipamentos
              </a>
              <a
                href="#background"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Background
              </a>
              <a
                href="#relacionamentos"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Relacionamentos
              </a>
              <a
                href="#curiosidades"
                className="relative px-4 py-2 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#3E526E] after:transition-all after:duration-300 hover:after:w-full"
              >
                Curiosidades
              </a>
            </div>

            {/* Seção: Personalidade */}
            <div
              id="personalidade"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Personalidade</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.personalidade ? (
                  <p>{characterData.personalidade}</p>
                ) : (
                  <p className="text-gray-500 italic">Descreva aqui a personalidade do personagem, seus traços de caráter, comportamentos típicos, valores e crenças.</p>
                )}
              </div>
            </div>

            {/* Seção: Aparência */}
            <div
              id="aparencia"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Aparência</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.aparencia ? (
                  <p>{characterData.aparencia}</p>
                ) : (
                  <p className="text-gray-500 italic">Descreva aqui as características físicas do personagem: altura, peso, cor dos olhos, cabelo, características distintivas, etc.</p>
                )}
              </div>
            </div>

            {/* Seção: Habilidades e Poderes */}
            <div
              id="habilidades"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Habilidades e Poderes</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.habilidades ? (
                  <p>{characterData.habilidades}</p>
                ) : (
                  <p className="text-gray-500 italic">Liste aqui as habilidades especiais, poderes, talentos e capacidades únicas do personagem.</p>
                )}
              </div>
            </div>

            {/* Seção: Equipamentos */}
            <div
              id="equipamentos"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Equipamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.equipamentos ? (
                  <p>{characterData.equipamentos}</p>
                ) : (
                  <p className="text-gray-500 italic">Descreva aqui as armas, armaduras, itens especiais e equipamentos que o personagem utiliza.</p>
                )}
              </div>
            </div>

            {/* Seção: Background */}
            <div
              id="background"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Background</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.background ? (
                  <p>{characterData.background}</p>
                ) : (
                  <p className="text-gray-500 italic">Conte aqui a história de fundo do personagem: sua origem, passado, eventos importantes que moldaram quem ele é hoje.</p>
                )}
              </div>
            </div>

            {/* Seção: Relacionamentos */}
            <div
              id="relacionamentos"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Relacionamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.relacionamentos ? (
                  <p>{characterData.relacionamentos}</p>
                ) : (
                  <p className="text-gray-500 italic">Descreva aqui os relacionamentos do personagem: família, amigos, aliados, inimigos e outras conexões importantes.</p>
                )}
              </div>
            </div>

            {/* Seção: Curiosidades */}
            <div
              id="curiosidades"
              className="flex flex-col pb-[40px] scroll-mt-[100px]"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Curiosidades</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {characterData.curiosidades ? (
                  <p>{characterData.curiosidades}</p>
                ) : (
                  <p className="text-gray-500 italic">Adicione aqui fatos interessantes, detalhes curiosos, manias, preferências e outras informações divertidas sobre o personagem.</p>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <Link
                href={`/fandom/${fandomId}/characters`}
                className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
              >
                Ver Todos os Personagens
              </Link>
              <Link
                href={`/fandom/${fandomId}`}
                className="bg-[#926DF6] text-white px-6 py-3 rounded-lg hover:bg-[#A98AF8] transition-colors text-center font-medium"
              >
                Voltar para {fandom.name}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 