'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import FandomHeader from "@/components/ui/FandomHeader";

interface Fandom {
  id: string;
  name: string;
  description: string;
  creator_id: string;
}

interface Character {
  id: string;
  item_title: string;
  item_description: string;
  item_image_url: string;
  item_color: string;
  custom_data?: {
    categories?: string[];
  };
}

interface Filter {
  id: string;
  filter_label: string;
  filter_value: string;
  is_active: boolean;
  filter_order: number;
  filter_color: string;
}

export default function ManageFiltersPage() {
  const params = useParams();
  const fandomId = params.id as string;

  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para formulários
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [newFilterColor, setNewFilterColor] = useState('#926DF6');
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      // Carregar fandom
      const { data: fandomData, error: fandomError } = await supabase
        .from('fandoms')
        .select('*')
        .eq('id', fandomId)
        .single();

      if (fandomError) throw new Error('Fandom não encontrada');
      setFandom(fandomData);

      // Carregar página da fandom
      const { data: pageData, error: pageError } = await supabase
        .from('fandom_pages')
        .select('*')
        .eq('fandom_id', fandomId)
        .single();

      if (pageError) throw new Error('Página da fandom não encontrada');

      // Carregar seção de personagens
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', pageData.id)
        .eq('section_title', 'Personagens')
        .single();

      if (sectionsError) throw new Error('Seção de personagens não encontrada');

      // Carregar personagens
      const { data: charactersData, error: charactersError } = await supabase
        .from('section_items')
        .select('*')
        .eq('section_id', sectionsData.id)
        .eq('item_type', 'character')
        .eq('is_active', true)
        .order('item_order');

      if (charactersError) throw new Error('Erro ao carregar personagens');
      setCharacters(charactersData || []);

      // Carregar filtros
      const { data: filtersData, error: filtersError } = await supabase
        .from('section_filters')
        .select('*')
        .eq('section_id', sectionsData.id)
        .order('filter_order');

      if (filtersError) throw new Error('Erro ao carregar filtros');
      setFilters(filtersData || []);

    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [fandomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adicionar novo filtro
  const addFilter = async () => {
    if (!newFilterName.trim() || !newFilterValue.trim()) return;

    try {
      const { data: pageData } = await supabase
        .from('fandom_pages')
        .select('*')
        .eq('fandom_id', fandomId)
        .single();

      const { data: sectionData } = await supabase
        .from('fandom_sections')
        .select('*')
        .eq('fandom_page_id', pageData.id)
        .eq('section_title', 'Personagens')
        .single();

      const newOrder = filters.length + 1;

      const { data: newFilter, error } = await supabase
        .from('section_filters')
        .insert({
          section_id: sectionData.id,
          filter_label: newFilterName,
          filter_value: newFilterValue,
          filter_order: newOrder,
          filter_color: newFilterColor,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      setFilters(prev => [...prev, newFilter]);
      setNewFilterName('');
      setNewFilterValue('');
      setNewFilterColor('#926DF6');
    } catch (error) {
      console.error('Erro ao adicionar filtro:', error);
    }
  };

  // Editar filtro
  const updateFilter = async (filterId: string, updates: Partial<Filter>) => {
    try {
      const { error } = await supabase
        .from('section_filters')
        .update(updates)
        .eq('id', filterId);

      if (error) throw error;

      setFilters(prev => prev.map(f => 
        f.id === filterId ? { ...f, ...updates } : f
      ));
      setEditingFilter(null);
    } catch (error) {
      console.error('Erro ao atualizar filtro:', error);
    }
  };

  // Excluir filtro
  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase
        .from('section_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      setFilters(prev => prev.filter(f => f.id !== filterId));
    } catch (error) {
      console.error('Erro ao excluir filtro:', error);
    }
  };

  // Associar personagem a filtro
  const assignCharacterToFilter = async (characterId: string, filterValue: string) => {
    try {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      const currentCategories = character.custom_data?.categories || [];
      const newCategories = currentCategories.includes(filterValue) 
        ? currentCategories.filter(c => c !== filterValue)
        : [...currentCategories, filterValue];

      const { error } = await supabase
        .from('section_items')
        .update({
          custom_data: { ...character.custom_data, categories: newCategories }
        })
        .eq('id', characterId);

      if (error) throw error;

      setCharacters(prev => prev.map(c => 
        c.id === characterId 
          ? { ...c, custom_data: { ...c.custom_data, categories: newCategories } }
          : c
      ));
    } catch (error) {
      console.error('Erro ao associar personagem:', error);
    }
  };

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
            Voltar para Fandom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#875CF5]">
      <FandomHeader
        fandomName={fandom?.name || ''}
        fandomDescription={fandom?.description || ''}
        fandomId={fandomId}
        creatorId={fandom?.creator_id || ''}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Gerenciar Filtros</h1>
            <Link
              href={`/fandom/${fandomId}`}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Voltar para Fandom
            </Link>
          </div>

          {/* Adicionar Novo Filtro */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Novo Filtro</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome do filtro (ex: Protagonistas)"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Valor (ex: protagonists)"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
              />
              <input
                type="color"
                value={newFilterColor}
                onChange={(e) => setNewFilterColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <button
                onClick={addFilter}
                className="bg-[#926DF6] text-white px-6 py-2 rounded-lg hover:bg-[#A98AF8] transition-colors"
              >
                Adicionar Filtro
              </button>
            </div>
          </div>

          {/* Lista de Filtros */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Filtros Existentes</h2>
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                  {editingFilter?.id === filter.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={editingFilter.filter_label}
                        onChange={(e) => setEditingFilter({...editingFilter, filter_label: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editingFilter.filter_value}
                        onChange={(e) => setEditingFilter({...editingFilter, filter_value: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="color"
                        value={editingFilter.filter_color}
                        onChange={(e) => setEditingFilter({...editingFilter, filter_color: e.target.value})}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateFilter(filter.id, editingFilter)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingFilter(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: filter.filter_color }}
                        />
                        <span className="font-semibold">{filter.filter_label}</span>
                        <span className="text-gray-500">({filter.filter_value})</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          filter.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {filter.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingFilter(filter)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => updateFilter(filter.id, { is_active: !filter.is_active })}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            filter.is_active 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {filter.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => deleteFilter(filter.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Associar Personagens */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Associar Personagens aos Filtros</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filters.filter(f => f.is_active).map((filter) => (
                <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: filter.filter_color }}
                    />
                    {filter.filter_label}
                  </h3>
                  <div className="space-y-2">
                    {characters.map((character) => {
                      const isAssigned = character.custom_data?.categories?.includes(filter.filter_value);
                      return (
                        <div key={character.id} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                          <span className="text-sm">{character.item_title}</span>
                          <button
                            onClick={() => assignCharacterToFilter(character.id, filter.filter_value)}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              isAssigned
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {isAssigned ? 'Remover' : 'Adicionar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 