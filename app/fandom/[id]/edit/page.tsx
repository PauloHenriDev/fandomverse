'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddCharacterModal from "../../../../components/ui/AddCharacterModal";

// Interfaces para os dados
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
}

interface Fandom {
  id: string;
  name: string;
  description: string;
  image_url: string;
  creator_id: string;
}

/**
 * Página de edição da fandom
 * 
 * Esta página permite que o criador da fandom:
 * - Edite informações básicas da página
 * - Personalize cores
 * - Reordene seções
 * - Adicione/remova seções
 * - Personalize conteúdo
 * - Gerencie personagens
 */
export default function EditFandomPage() {
  const params = useParams();
  const router = useRouter();
  const fandomId = params.id as string;

  // Estados para gerenciar dados
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [sections, setSections] = useState<FandomSection[]>([]);
  const [sectionItems, setSectionItems] = useState<{ [sectionId: string]: SectionItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Estados para o modal de personagens
  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Estados para edição
  const [editData, setEditData] = useState({
    page_title: "",
    page_description: "",
    hero_title: "",
    hero_description: "",
    hero_primary_button_text: "",
    hero_secondary_button_text: "",
    hero_primary_button_color: "#926DF6",
    hero_secondary_button_color: "#926DF6",
    background_color: "#875CF5"
  });

  // Hook que executa quando o componente é montado
  const checkAuthAndLoadData = useCallback(async () => {
    try {
      // Verifica se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
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

      // Verifica se o usuário é o criador da fandom
      if (fandomData.creator_id !== user.id) {
        router.push(`/fandom/${fandomId}`);
        return;
      }

      setFandom(fandomData);

      // Carrega dados da página
      const { data: pageData, error: pageError } = await supabase
        .from('fandom_pages')
        .select('*')
        .eq('fandom_id', fandomId)
        .single();

      if (pageError) {
        throw new Error('Página da fandom não encontrada');
      }

      setFandomPage(pageData);
      setEditData({
        page_title: pageData.page_title,
        page_description: pageData.page_description,
        hero_title: pageData.hero_title,
        hero_description: pageData.hero_description,
        hero_primary_button_text: pageData.hero_primary_button_text,
        hero_secondary_button_text: pageData.hero_secondary_button_text,
        hero_primary_button_color: pageData.hero_primary_button_color,
        hero_secondary_button_color: pageData.hero_secondary_button_color,
        background_color: pageData.background_color
      });

      // Carrega seções
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', pageData.id)
        .order('section_order');

      if (sectionsError) {
        console.error('Erro ao carregar seções:', sectionsError);
      } else {
        setSections(sectionsData || []);
        
        // Carrega itens de cada seção
        if (sectionsData) {
          const itemsData: { [sectionId: string]: SectionItem[] } = {};
          for (const section of sectionsData) {
            const { data: items, error: itemsError } = await supabase
              .from('section_items')
              .select('*')
              .eq('section_id', section.id)
              .order('item_order');
            
            if (!itemsError) {
              itemsData[section.id] = items || [];
            }
          }
          setSectionItems(itemsData);
        }
      }

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [fandomId, router]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [fandomId, checkAuthAndLoadData]);

  /**
   * Salva as alterações da página
   */
  const handleSave = async () => {
    if (!fandomPage) return;

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from('fandom_pages')
        .update(editData)
        .eq('id', fandomPage.id);

      if (error) {
        throw error;
      }

      setMessage("Alterações salvas com sucesso!");
      setTimeout(() => {
        router.push(`/fandom/${fandomId}`);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setMessage("Erro ao salvar: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Atualiza um campo do formulário
   */
  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Move uma seção para cima ou para baixo
   */
  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    const section = newSections[sectionIndex];

    if (direction === 'up' && sectionIndex > 0) {
      const prevSection = newSections[sectionIndex - 1];
      newSections[sectionIndex - 1] = { ...section, section_order: prevSection.section_order };
      newSections[sectionIndex] = { ...prevSection, section_order: section.section_order };
    } else if (direction === 'down' && sectionIndex < newSections.length - 1) {
      const nextSection = newSections[sectionIndex + 1];
      newSections[sectionIndex + 1] = { ...section, section_order: nextSection.section_order };
      newSections[sectionIndex] = { ...nextSection, section_order: section.section_order };
    }

    setSections(newSections);

    // Atualiza no banco de dados
    try {
      await supabase
        .from('fandom_sections')
        .update({ section_order: newSections[sectionIndex].section_order })
        .eq('id', sectionId);
    } catch (error) {
      console.error('Erro ao reordenar seção:', error);
    }
  };

  /**
   * Abre o modal para adicionar personagem
   */
  const handleAddCharacter = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowAddCharacterModal(true);
  };

  /**
   * Recarrega os personagens após adicionar um novo
   */
  const handleCharacterAdded = async () => {
    if (!selectedSectionId) return;

    try {
      const { data: items, error } = await supabase
        .from('section_items')
        .select('*')
        .eq('section_id', selectedSectionId)
        .order('item_order');

      if (!error) {
        setSectionItems(prev => ({
          ...prev,
          [selectedSectionId]: items || []
        }));
      }
    } catch (error) {
      console.error('Erro ao recarregar personagens:', error);
    }
  };

  /**
   * Exclui um personagem
   */
  const handleDeleteCharacter = async (itemId: string, sectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('section_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      // Remove da lista local
      setSectionItems(prev => ({
        ...prev,
        [sectionId]: prev[sectionId]?.filter(item => item.id !== itemId) || []
      }));

      setMessage('Personagem excluído com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao excluir personagem: ' + errorMessage);
    }
  };

  // Estados de loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#926DF6]"></div>
      </div>
    );
  }

  if (!fandom || !fandomPage) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erro</h1>
          <p className="text-red-700 mb-4">Não foi possível carregar os dados da fandom.</p>
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
    <div className="max-w-4xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href={`/fandom/${fandomId}`} className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Página da Fandom
        </Link>
      </div>

      {/* Container principal */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          Editar Página: {fandom.name}
        </h1>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base ${
            message.includes('Erro') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Formulário de edição */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 sm:space-y-6">
          {/* Seção: Informações Básicas */}
          <div className="border-b border-gray-200 pb-4 sm:pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={editData.page_title}
                  onChange={(e) => handleInputChange('page_title', e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Descrição da Página
                </label>
                <input
                  type="text"
                  value={editData.page_description}
                  onChange={(e) => handleInputChange('page_description', e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Seção: Hero Section */}
          <div className="border-b border-gray-200 pb-4 sm:pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Seção Hero</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Título do Hero
                  </label>
                  <input
                    type="text"
                    value={editData.hero_title}
                    onChange={(e) => handleInputChange('hero_title', e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Descrição do Hero
                  </label>
                  <input
                    type="text"
                    value={editData.hero_description}
                    onChange={(e) => handleInputChange('hero_description', e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão Primário
                  </label>
                  <input
                    type="text"
                    value={editData.hero_primary_button_text}
                    onChange={(e) => handleInputChange('hero_primary_button_text', e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão Secundário
                  </label>
                  <input
                    type="text"
                    value={editData.hero_secondary_button_text}
                    onChange={(e) => handleInputChange('hero_secondary_button_text', e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Cores */}
          <div className="border-b border-gray-200 pb-4 sm:pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Personalização de Cores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-10 h-8 sm:w-12 sm:h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Cor do Botão Primário
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.hero_primary_button_color}
                    onChange={(e) => handleInputChange('hero_primary_button_color', e.target.value)}
                    className="w-10 h-8 sm:w-12 sm:h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.hero_primary_button_color}
                    onChange={(e) => handleInputChange('hero_primary_button_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Cor do Botão Secundário
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.hero_secondary_button_color}
                    onChange={(e) => handleInputChange('hero_secondary_button_color', e.target.value)}
                    className="w-10 h-8 sm:w-12 sm:h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.hero_secondary_button_color}
                    onChange={(e) => handleInputChange('hero_secondary_button_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Gerenciamento de Seções */}
          <div className="border-b border-gray-200 pb-4 sm:pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Gerenciar Seções</h2>
            
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">{section.section_title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{section.section_type}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 text-sm"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 text-sm"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Se for seção de personagens, mostra os personagens */}
                  {section.section_title === 'Personagens' && (
                    <div className="mt-3 sm:mt-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                        <h4 className="font-medium text-gray-700 text-sm sm:text-base">Personagens ({sectionItems[section.id]?.length || 0})</h4>
                        <button
                          type="button"
                          onClick={() => handleAddCharacter(section.id)}
                          className="bg-[#926DF6] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-[#A98AF8] transition-colors whitespace-nowrap"
                        >
                          + Adicionar Personagem
                        </button>
                      </div>
                      
                      {sectionItems[section.id] && sectionItems[section.id].length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {sectionItems[section.id].map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-800 text-xs sm:text-sm truncate flex-1">{item.item_title}</h5>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCharacter(item.id, section.id)}
                                  className="text-red-500 hover:text-red-700 p-1 ml-2 flex-shrink-0"
                                  title="Excluir personagem"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.item_description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs sm:text-sm">Nenhum personagem adicionado ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#926DF6] text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            
            <Link
              href={`/fandom/${fandomId}`}
              className="flex-1 bg-gray-500 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium text-center text-sm sm:text-base"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Modal para adicionar personagem */}
      <AddCharacterModal
        isOpen={showAddCharacterModal}
        onClose={() => setShowAddCharacterModal(false)}
        sectionId={selectedSectionId}
        onCharacterAdded={handleCharacterAdded}
      />
    </div>
  );
} 