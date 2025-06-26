'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
 * Página de edição da ficha do personagem
 * 
 * Permite editar:
 * - Informações básicas (nome, descrição, imagem, cor)
 * - Conteúdo das seções específicas
 * - Salvar alterações
 */
export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const fandomId = params.id as string;
  const characterId = params.characterId as string;

  // Estados para gerenciar dados
  const [user, setUser] = useState<User | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    color: '#926DF6',
    // Seções específicas
    personalidade: '',
    aparencia: '',
    habilidades: '',
    equipamentos: '',
    background: '',
    relacionamentos: '',
    curiosidades: '',
    quote: '',
    quoteSource: ''
  });

  // Hook que executa quando o componente é montado
  const loadCharacter = useCallback(async () => {
    try {
      // Verifica se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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

      // Verifica se o usuário é o criador da fandom
      if (user.id !== fandomData.creator_id) {
        throw new Error('Você não tem permissão para editar este personagem');
      }

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

      // Preenche o formulário com os dados atuais
      setFormData({
        title: characterData.item_title,
        description: characterData.item_description,
        image_url: characterData.item_image_url || '',
        color: characterData.item_color,
        // Carrega dados das seções específicas
        personalidade: customData.personalidade || '',
        aparencia: customData.aparencia || '',
        habilidades: customData.habilidades || '',
        equipamentos: customData.equipamentos || '',
        background: customData.background || '',
        relacionamentos: customData.relacionamentos || '',
        curiosidades: customData.curiosidades || '',
        quote: customData.quote || '',
        quoteSource: customData.quoteSource || ''
      });

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

  // Função para salvar alterações
  const handleSave = async () => {
    if (!character) return;

    setSaving(true);
    try {
      // Prepara os dados customizados
      const customData = {
        personalidade: formData.personalidade,
        aparencia: formData.aparencia,
        habilidades: formData.habilidades,
        equipamentos: formData.equipamentos,
        background: formData.background,
        relacionamentos: formData.relacionamentos,
        curiosidades: formData.curiosidades,
        quote: formData.quote,
        quoteSource: formData.quoteSource
      };

      const { error } = await supabase
        .from('section_items')
        .update({
          item_title: formData.title,
          item_description: formData.description,
          item_image_url: formData.image_url || null,
          item_color: formData.color,
          custom_data: customData
        })
        .eq('id', character.id);

      if (error) {
        throw new Error('Erro ao salvar alterações');
      }

      // Redireciona para a ficha do personagem
      router.push(`/fandom/${fandomId}/characters/${characterId}`);

    } catch (error: unknown) {
      console.error('Erro ao salvar:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
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
            href={`/fandom/${fandomId}/characters/${characterId}`}
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para o Personagem
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
                  href={`/fandom/${fandomId}/characters/${characterId}`}
                  className="text-[#926DF6] hover:text-[#A98AF8] transition-colors text-sm sm:text-base"
                >
                  ← Voltar para o Personagem
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Editar {character.item_title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Edite as informações da ficha do personagem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          
          {/* Informações Básicas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Personagem *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Nome do personagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Personagem
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                placeholder="Descreva o personagem..."
              />
            </div>
          </div>

          {/* Citação */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Citação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citação
                </label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Uma citação marcante do personagem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte da Citação
                </label>
                <input
                  type="text"
                  value={formData.quoteSource}
                  onChange={(e) => setFormData({ ...formData, quoteSource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Quem disse a citação..."
                />
              </div>
            </div>
          </div>

          {/* Seções Específicas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Seções da Ficha</h2>
            
            <div className="space-y-6">
              {[
                { key: 'personalidade', label: 'Personalidade', placeholder: 'Descreva a personalidade do personagem...' },
                { key: 'aparencia', label: 'Aparência', placeholder: 'Descreva as características físicas...' },
                { key: 'habilidades', label: 'Habilidades e Poderes', placeholder: 'Liste as habilidades especiais...' },
                { key: 'equipamentos', label: 'Equipamentos', placeholder: 'Descreva armas, armaduras, itens...' },
                { key: 'background', label: 'Background', placeholder: 'Conte a história de fundo...' },
                { key: 'relacionamentos', label: 'Relacionamentos', placeholder: 'Descreva família, amigos, inimigos...' },
                { key: 'curiosidades', label: 'Curiosidades', placeholder: 'Adicione fatos interessantes...' }
              ].map((section) => (
                <div key={section.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {section.label}
                  </label>
                  <textarea
                    value={formData[section.key as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [section.key]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                    placeholder={section.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.description}
              className="bg-[#926DF6] text-white px-6 py-3 rounded-lg hover:bg-[#A98AF8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            
            <Link
              href={`/fandom/${fandomId}/characters/${characterId}`}
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 