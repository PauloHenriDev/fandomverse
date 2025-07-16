'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FandomHeader from "@/components/ui/FandomHeader";

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

interface Race {
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
 * Página de edição da ficha da raça
 * 
 * Permite editar:
 * - Informações básicas (nome, descrição, imagem, cor)
 * - Conteúdo das seções específicas
 * - Salvar alterações
 */
export default function EditRacePage() {
  const params = useParams();
  const router = useRouter();
  const fandomId = params.id as string;
  const raceId = params.raceId as string;

  // Estados para gerenciar dados
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    color: '#926DF6',
    // Seções específicas para raças
    caracteristicas: '',
    habilidades: '',
    cultura: '',
    historia: '',
    localizacao: '',
    populacao: '',
    curiosidades: '',
    quote: '',
    quoteSource: ''
  });

  // Hook que executa quando o componente é montado
  const loadRace = useCallback(async () => {
    try {
      // Verifica se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();

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
        throw new Error('Você não tem permissão para editar esta raça');
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

      // Carrega dados da raça específica
      const { data: raceData, error: raceError } = await supabase
        .from('section_items')
        .select('*')
        .eq('id', raceId)
        .eq('item_type', 'race')
        .eq('is_active', true)
        .single();

      if (raceError) {
        throw new Error('Raça não encontrada');
      }

      setRace(raceData);

      // Extrai dados customizados
      const customData = raceData.custom_data || {};
      console.log('Dados customizados carregados:', customData);

      // Preenche o formulário com os dados atuais
      const formDataToSet = {
        title: raceData.item_title,
        description: raceData.item_description,
        image_url: raceData.item_image_url || '',
        color: raceData.item_color,
        // Carrega dados das seções específicas
        caracteristicas: customData.caracteristicas || '',
        habilidades: customData.habilidades || '',
        cultura: customData.cultura || '',
        historia: customData.historia || '',
        localizacao: customData.localizacao || '',
        populacao: customData.populacao || '',
        curiosidades: customData.curiosidades || '',
        quote: customData.quote || '',
        quoteSource: customData.quoteSource || ''
      };

      console.log('Formulário preenchido com:', formDataToSet);
      setFormData(formDataToSet);

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [fandomId, raceId]);

  useEffect(() => {
    loadRace();
  }, [loadRace]);

  // Função para salvar alterações
  const handleSave = async () => {
    if (!race) return;

    setSaving(true);
    try {
      // Prepara os dados customizados
      const customData = {
        caracteristicas: formData.caracteristicas,
        habilidades: formData.habilidades,
        cultura: formData.cultura,
        historia: formData.historia,
        localizacao: formData.localizacao,
        populacao: formData.populacao,
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
        .eq('id', race.id);

      if (error) {
        throw new Error('Erro ao salvar alterações');
      }

      // Redireciona para a ficha da raça
      router.push(`/fandom/${fandomId}/races/${raceId}`);

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
            href={`/fandom/${fandomId}/races/${raceId}`}
            className="bg-[#926DF6] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors text-sm sm:text-base"
          >
            Voltar para a Raça
          </Link>
        </div>
      </div>
    );
  }

  if (!fandom || !fandomPage || !race) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-4">Página não encontrada</h1>
          <p className="text-sm sm:text-base text-yellow-700 mb-4">Esta raça não foi encontrada.</p>
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
      {/* Header com estilo do Header.tsx global */}
      <FandomHeader
        fandomName={fandom.name}
        fandomDescription={fandom.description}
        fandomId={fandomId}
        creatorId={fandom.creator_id}
      />

      {/* Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link 
            href={`/fandom/${fandomId}/races/${raceId}`}
            className="text-[#926DF6] hover:text-[#A98AF8] transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para a Raça
          </Link>
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          
          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Editar {race.item_title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Edite as informações da ficha da raça
            </p>
          </div>

          {/* Informações Básicas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Raça *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Nome da raça"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor da Raça
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
                placeholder="Descreva a raça..."
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
                  placeholder="Uma citação marcante sobre a raça..."
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
                { key: 'caracteristicas', label: 'Características Físicas', placeholder: 'Descreva as características físicas da raça...' },
                { key: 'habilidades', label: 'Habilidades e Poderes', placeholder: 'Liste as habilidades especiais da raça...' },
                { key: 'cultura', label: 'Cultura e Sociedade', placeholder: 'Descreva a cultura, costumes e organização social...' },
                { key: 'historia', label: 'História e Origem', placeholder: 'Conte a história de fundo e origem da raça...' },
                { key: 'localizacao', label: 'Localização e Território', placeholder: 'Descreva onde a raça vive e seus territórios...' },
                { key: 'populacao', label: 'População e Demografia', placeholder: 'Informações sobre números e distribuição...' },
                { key: 'curiosidades', label: 'Curiosidades', placeholder: 'Adicione fatos interessantes sobre a raça...' }
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
              href={`/fandom/${fandomId}/races/${raceId}`}
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