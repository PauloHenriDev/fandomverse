'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

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
 */
export default function EditFandomPage() {
  const params = useParams();
  const router = useRouter();
  const fandomId = params.id as string;

  // Estados para gerenciar dados
  const [user, setUser] = useState<User | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [sections, setSections] = useState<FandomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
  useEffect(() => {
    checkAuthAndLoadData();
  }, [fandomId]);

  /**
   * Verifica autenticação e carrega dados
   */
  const checkAuthAndLoadData = async () => {
    try {
      // Verifica se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
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
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: any) {
      setMessage("Erro ao salvar: " + error.message);
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
    <div className="max-w-4xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/fandom/${fandomId}`} className="inline-flex items-center text-[#926DF6] hover:text-[#A98AF8] transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Página da Fandom
        </Link>
      </div>

      {/* Container principal */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Editar Página: {fandom.name}
        </h1>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`p-3 rounded-lg mb-6 ${
            message.includes('Erro') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Formulário de edição */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Seção: Informações Básicas */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={editData.page_title}
                  onChange={(e) => handleInputChange('page_title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da Página
                </label>
                <input
                  type="text"
                  value={editData.page_description}
                  onChange={(e) => handleInputChange('page_description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Seção: Hero Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Seção Hero</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Hero
                  </label>
                  <input
                    type="text"
                    value={editData.hero_title}
                    onChange={(e) => handleInputChange('hero_title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do Hero
                  </label>
                  <input
                    type="text"
                    value={editData.hero_description}
                    onChange={(e) => handleInputChange('hero_description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão Primário
                  </label>
                  <input
                    type="text"
                    value={editData.hero_primary_button_text}
                    onChange={(e) => handleInputChange('hero_primary_button_text', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão Secundário
                  </label>
                  <input
                    type="text"
                    value={editData.hero_secondary_button_text}
                    onChange={(e) => handleInputChange('hero_secondary_button_text', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Cores */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personalização de Cores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Botão Primário
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.hero_primary_button_color}
                    onChange={(e) => handleInputChange('hero_primary_button_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.hero_primary_button_color}
                    onChange={(e) => handleInputChange('hero_primary_button_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Botão Secundário
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editData.hero_secondary_button_color}
                    onChange={(e) => handleInputChange('hero_secondary_button_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editData.hero_secondary_button_color}
                    onChange={(e) => handleInputChange('hero_secondary_button_color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Gerenciamento de Seções */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Gerenciar Seções</h2>
            
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{section.section_title}</h3>
                    <p className="text-sm text-gray-600">{section.section_type}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#926DF6] text-white py-3 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            
            <Link
              href={`/fandom/${fandomId}`}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 