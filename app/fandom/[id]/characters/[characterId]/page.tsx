'use client';

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FandomHeader from "@/components/ui/FandomHeader";
import { User } from "@supabase/supabase-js";
import ImageUpload from "@/components/ui/ImageUpload";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';

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

// Modal para editar informações da sidebar
function SidebarEditModal({ 
  isOpen, 
  onClose, 
  character, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  character: Character | null; 
  onSave: (data: {
    item_title: string;
    item_description: string;
    item_image_url: string | null;
    item_color: string;
  }) => void; 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    color: '#926DF6'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (character && isOpen) {
      setFormData({
        title: character.item_title,
        description: character.item_description,
        image_url: character.item_image_url || '',
        color: character.item_color
      });
    }
  }, [character, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('section_items')
        .update({
          item_title: formData.title,
          item_description: formData.description,
          item_image_url: formData.image_url || null,
          item_color: formData.color
        })
        .eq('id', character.id);

      if (error) {
        throw error;
      }

      setMessage('Informações atualizadas com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave({
        item_title: formData.title,
        item_description: formData.description,
        item_image_url: formData.image_url || null,
        item_color: formData.color
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao atualizar: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Editar Informações Básicas</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${
            message.includes('sucesso') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Personagem *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Digite o nome do personagem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição Curta (Sidebar) *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6] resize-none"
              placeholder="Descrição curta para a sidebar..."
            />
            <p className="text-xs text-gray-500 mt-1">Esta descrição aparece na sidebar e nos cards de listagem.</p>
          </div>

          {/* Upload de Imagem */}
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageUploaded={handleImageUploaded}
            bucketName="character-images"
            folderName="characters"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do Card
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#926DF6] text-white rounded-md hover:bg-[#A98AF8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para editar informações da sidebar (seções Informações e Aparência)
function SidebarInfoEditModal({ 
  isOpen, 
  onClose, 
  character, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  character: Character | null; 
  onSave: (data: {
    item_title: string;
    item_color: string;
    item_order: number;
    is_active: boolean;
  }) => void; 
}) {
  const [formData, setFormData] = useState({
    title: '',
    color: '#926DF6',
    order: 1,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (character && isOpen) {
      setFormData({
        title: character.item_title,
        color: character.item_color,
        order: character.item_order,
        is_active: true
      });
    }
  }, [character, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('section_items')
        .update({
          item_title: formData.title,
          item_color: formData.color,
          item_order: formData.order,
          is_active: true
        })
        .eq('id', character.id);

      if (error) {
        throw error;
      }

      setMessage('Informações da sidebar atualizadas com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave({
        item_title: formData.title,
        item_color: formData.color,
        item_order: formData.order,
        is_active: true
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao atualizar: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Editar Informações da Sidebar</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm sm:text-base ${
            message.includes('Erro') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Nome do Personagem *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
              placeholder="Digite o nome do personagem"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Cor do Card
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-10 h-8 sm:w-12 sm:h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">Define a ordem em que o personagem aparece na lista.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-2 sm:py-2 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {loading ? 'Salvando...' : 'Salvar Informações'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 sm:py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Adiciona um componente EditorTiptap para uso nos campos de texto longo
function EditorTiptap({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, LinkExtension],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg p-2 bg-white">
      {/* Toolbar visual com ícones */}
      <div className="flex flex-wrap gap-1 mb-2 items-center bg-gray-50 rounded-md px-2 py-1 shadow-sm border border-gray-200">
        {/* Bold */}
        <button type="button" title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-[#926DF6]/20 text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.25 8.5A3.75 3.75 0 0 0 13.5 4.75h-3.75v14.5H14a3.75 3.75 0 0 0 3.25-6.25A3.75 3.75 0 0 0 17.25 8.5Z"/></svg>
        </button>
        {/* Italic */}
        <button type="button" title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-[#926DF6]/20 text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 4h-9M14 20H5M15 4l-6 16"/></svg>
        </button>
        {/* Separator */}
        <span className="mx-1 w-px h-5 bg-gray-200" />
        {/* Bullet List */}
        <button type="button" title="Lista não ordenada" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-[#926DF6]/20 text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="6" cy="7" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="6" cy="17" r="1.5"/><line x1="10" y1="7" x2="20" y2="7"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="17" x2="20" y2="17"/></svg>
        </button>
        {/* Ordered List */}
        <button type="button" title="Lista ordenada" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-[#926DF6]/20 text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><text x="3" y="9" fontSize="8">1.</text><text x="3" y="14" fontSize="8">2.</text><text x="3" y="19" fontSize="8">3.</text><line x1="10" y1="7" x2="20" y2="7"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="17" x2="20" y2="17"/></svg>
        </button>
        {/* Separator */}
        <span className="mx-1 w-px h-5 bg-gray-200" />
        {/* Link */}
        <button type="button" title="Adicionar/Editar Link" onClick={() => {
          const previousUrl = editor.getAttributes('link').href || '';
          const url = window.prompt('URL do link:', previousUrl);
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().setLink({ href: url }).run();
        }} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-[#926DF6]/20 text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7-7l1-1"/><path d="M14 11a5 5 0 0 0-7-7l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
        </button>
        <button type="button" title="Remover Link" onClick={() => editor.chain().focus().unsetLink().run()} className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'text-[#926DF6]' : 'text-gray-700'}`}> 
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 7l-7 7"/><path d="M7 17l7-7"/></svg>
        </button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm prose-a:underline focus:outline-none focus:ring-0 focus:border-0 border-0" />
    </div>
  );
}

// Modal para editar conteúdo principal da ficha
function MainContentEditModal({ 
  isOpen, 
  onClose, 
  character, 
  characterData,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  character: Character | null; 
  characterData: Record<string, string>;
  onSave: (data: Record<string, string>) => void; 
}) {
  const [formData, setFormData] = useState({
    descricaoDetalhada: '',
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        descricaoDetalhada: characterData.descricaoDetalhada || '',
        personalidade: characterData.personalidade || '',
        aparencia: characterData.aparencia || '',
        habilidades: characterData.habilidades || '',
        equipamentos: characterData.equipamentos || '',
        background: characterData.background || '',
        relacionamentos: characterData.relacionamentos || '',
        curiosidades: characterData.curiosidades || '',
        quote: characterData.quote || '',
        quoteSource: characterData.quoteSource || ''
      });
    }
  }, [characterData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setLoading(true);
    setMessage('');

    try {
      // Preserva os dados da sidebar existentes e adiciona/atualiza apenas os dados do conteúdo principal
      const updatedCustomData = {
        ...characterData, // Mantém todos os dados existentes (incluindo dados da sidebar)
        ...formData // Adiciona/atualiza apenas os dados do conteúdo principal
      };

      const { error } = await supabase
        .from('section_items')
        .update({
          custom_data: updatedCustomData
        })
        .eq('id', character.id);

      if (error) {
        throw error;
      }

      setMessage('Conteúdo da ficha atualizado com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave(updatedCustomData);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao atualizar: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Editar Conteúdo da Ficha</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm sm:text-base ${
            message.includes('Erro') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição Detalhada (Ficha Principal)
            </label>
            <EditorTiptap
              value={formData.descricaoDetalhada}
              onChange={v => handleInputChange('descricaoDetalhada', v)}
            />
            <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Esta descrição aparece na seção principal da ficha, separada da descrição curta da sidebar.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personalidade
              </label>
              <EditorTiptap
                value={formData.personalidade}
                onChange={v => handleInputChange('personalidade', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aparência
              </label>
              <EditorTiptap
                value={formData.aparencia}
                onChange={v => handleInputChange('aparencia', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habilidades e Poderes
              </label>
              <EditorTiptap
                value={formData.habilidades}
                onChange={v => handleInputChange('habilidades', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipamentos
              </label>
              <EditorTiptap
                value={formData.equipamentos}
                onChange={v => handleInputChange('equipamentos', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <EditorTiptap
                value={formData.background}
                onChange={v => handleInputChange('background', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relacionamentos
              </label>
              <EditorTiptap
                value={formData.relacionamentos}
                onChange={v => handleInputChange('relacionamentos', v)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curiosidades
              </label>
              <EditorTiptap
                value={formData.curiosidades}
                onChange={v => handleInputChange('curiosidades', v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citação Marcante
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => handleInputChange('quote', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent resize-none"
                placeholder="Uma citação marcante do personagem..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte da Citação
              </label>
              <input
                type="text"
                value={formData.quoteSource}
                onChange={(e) => handleInputChange('quoteSource', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                placeholder="De onde vem a citação..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-3 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar Conteúdo da Ficha'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para editar sidebar com campos customizáveis
function SidebarCustomEditModal({ 
  isOpen, 
  onClose, 
  character, 
  characterData,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  character: Character | null; 
  characterData: Record<string, string>;
  onSave: (data: Record<string, string>) => void; 
}) {
  const [formData, setFormData] = useState({
    nome: '',
    status: 'Ativo',
    alias: '',
    dataNascimento: '',
    genero: '',
    afiliacao: '',
    especie: '',
    idade: '',
    altura: '',
    peso: '',
    corOlhos: '',
    tomPele: '',
    corCabelos: '',
    classe: '',
    nivel: '',
    alinhamento: '',
    statusVida: 'Vivo',
    corCard: '#926DF6',
    ordem: 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (character && isOpen) {
      setFormData({
        nome: character.item_title,
        status: character.is_active ? 'Ativo' : 'Inativo',
        alias: characterData.alias || '',
        dataNascimento: characterData.dataNascimento || '',
        genero: characterData.genero || '',
        afiliacao: characterData.afiliacao || '',
        especie: characterData.especie || '',
        idade: characterData.idade || '',
        altura: characterData.altura || '',
        peso: characterData.peso || '',
        corOlhos: characterData.corOlhos || '',
        tomPele: characterData.tomPele || '',
        corCabelos: characterData.corCabelos || '',
        classe: characterData.classe || '',
        nivel: characterData.nivel || '',
        alinhamento: characterData.alinhamento || '',
        statusVida: characterData.statusVida || 'Vivo',
        corCard: character.item_color,
        ordem: character.item_order
      });
    }
  }, [character, characterData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setLoading(true);
    setMessage('');

    try {
      // Prepara os dados customizados da sidebar
      const sidebarData = {
        alias: formData.alias,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero,
        afiliacao: formData.afiliacao,
        especie: formData.especie,
        idade: formData.idade,
        altura: formData.altura,
        peso: formData.peso,
        corOlhos: formData.corOlhos,
        tomPele: formData.tomPele,
        corCabelos: formData.corCabelos,
        classe: formData.classe,
        nivel: formData.nivel,
        alinhamento: formData.alinhamento,
        statusVida: formData.statusVida
      };

      // Preserva os dados do conteúdo principal existentes e adiciona/atualiza apenas os dados da sidebar
      const updatedCustomData = {
        ...characterData, // Mantém todos os dados existentes (incluindo dados do conteúdo principal)
        ...sidebarData // Adiciona/atualiza apenas os dados da sidebar
      };

      const { error } = await supabase
        .from('section_items')
        .update({
          item_title: formData.nome,
          item_color: formData.corCard,
          item_order: formData.ordem,
          is_active: formData.status === 'Ativo',
          custom_data: updatedCustomData
        })
        .eq('id', character.id);

      if (error) {
        throw error;
      }

      setMessage('Sidebar atualizada com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave(updatedCustomData);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao atualizar: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Editar Sidebar do Personagem</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm sm:text-base ${
            message.includes('Erro') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seção: Informações Básicas */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Personagem *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Nome do personagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alias
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Batman, Dark Knight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade
                </label>
                <input
                  type="text"
                  value={formData.idade}
                  onChange={(e) => handleInputChange('idade', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 25 anos, 150 anos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="text"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 15/03/1985, 23 de março de 1990"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Afiliação
                </label>
                <input
                  type="text"
                  value={formData.afiliacao}
                  onChange={(e) => handleInputChange('afiliacao', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Liga da Justiça, Vingadores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espécie
                </label>
                <input
                  type="text"
                  value={formData.especie}
                  onChange={(e) => handleInputChange('especie', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Humano, Elfo, Orc, Saiyajin"
                />
              </div>
            </div>
          </div>

          {/* Seção: Aparência */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Aparência</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tom de Pele
                </label>
                <input
                  type="text"
                  value={formData.tomPele}
                  onChange={(e) => handleInputChange('tomPele', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Clara, Média, Escura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor dos Olhos
                </label>
                <input
                  type="text"
                  value={formData.corOlhos}
                  onChange={(e) => handleInputChange('corOlhos', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Azul, Verde, Castanho"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor dos Cabelos
                </label>
                <input
                  type="text"
                  value={formData.corCabelos}
                  onChange={(e) => handleInputChange('corCabelos', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Loiro, Castanho, Preto, Ruivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura
                </label>
                <input
                  type="text"
                  value={formData.altura}
                  onChange={(e) => handleInputChange('altura', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 1.75m, 6'2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso
                </label>
                <input
                  type="text"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 70kg, 180lbs"
                />
              </div>
            </div>
          </div>

          {/* Seção: RPG/Game */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">RPG/Game</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <input
                  type="text"
                  value={formData.classe}
                  onChange={(e) => handleInputChange('classe', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Guerreiro, Mago, Ladino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível
                </label>
                <input
                  type="text"
                  value={formData.nivel}
                  onChange={(e) => handleInputChange('nivel', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 15, Mestre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alinhamento
                </label>
                <select
                  value={formData.alinhamento}
                  onChange={(e) => handleInputChange('alinhamento', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Leal e Bom">Leal e Bom</option>
                  <option value="Neutro e Bom">Neutro e Bom</option>
                  <option value="Caótico e Bom">Caótico e Bom</option>
                  <option value="Leal e Neutro">Leal e Neutro</option>
                  <option value="Neutro">Neutro</option>
                  <option value="Caótico e Neutro">Caótico e Neutro</option>
                  <option value="Leal e Mau">Leal e Mau</option>
                  <option value="Neutro e Mau">Neutro e Mau</option>
                  <option value="Caótico e Mau">Caótico e Mau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status de Vida
                </label>
                <select
                  value={formData.statusVida}
                  onChange={(e) => handleInputChange('statusVida', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                >
                  <option value="Vivo">Vivo</option>
                  <option value="Morto">Morto</option>
                  <option value="Desaparecido">Desaparecido</option>
                  <option value="Inconsciente">Inconsciente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Características */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <input
                  type="text"
                  value={formData.classe}
                  onChange={(e) => handleInputChange('classe', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: Guerreiro, Mago, Ladino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível
                </label>
                <input
                  type="text"
                  value={formData.nivel}
                  onChange={(e) => handleInputChange('nivel', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="Ex: 15, Mestre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alinhamento
                </label>
                <select
                  value={formData.alinhamento}
                  onChange={(e) => handleInputChange('alinhamento', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Leal e Bom">Leal e Bom</option>
                  <option value="Neutro e Bom">Neutro e Bom</option>
                  <option value="Caótico e Bom">Caótico e Bom</option>
                  <option value="Leal e Neutro">Leal e Neutro</option>
                  <option value="Neutro">Neutro</option>
                  <option value="Caótico e Neutro">Caótico e Neutro</option>
                  <option value="Leal e Mau">Leal e Mau</option>
                  <option value="Neutro e Mau">Neutro e Mau</option>
                  <option value="Caótico e Mau">Caótico e Mau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status de Vida
                </label>
                <select
                  value={formData.statusVida}
                  onChange={(e) => handleInputChange('statusVida', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                >
                  <option value="Vivo">Vivo</option>
                  <option value="Morto">Morto</option>
                  <option value="Desaparecido">Desaparecido</option>
                  <option value="Inconsciente">Inconsciente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Aparência */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Aparência</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Card
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.corCard}
                    onChange={(e) => handleInputChange('corCard', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.corCard}
                    onChange={(e) => handleInputChange('corCard', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => handleInputChange('ordem', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-3 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar Sidebar'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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

  // Estado para o modal de edição da sidebar
  const [showSidebarEditModal, setShowSidebarEditModal] = useState(false);

  // Estado para o modal de edição do conteúdo principal
  const [showMainContentEditModal, setShowMainContentEditModal] = useState(false);

  // Estado para o modal de edição das informações da sidebar
  const [showSidebarInfoEditModal, setShowSidebarInfoEditModal] = useState(false);

  // Estado para o modal de edição da sidebar com campos customizáveis
  const [showSidebarCustomEditModal, setShowSidebarCustomEditModal] = useState(false);

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

  // Função para atualizar dados do personagem após edição da sidebar
  const handleSidebarEditSave = (updatedData: {
    item_title: string;
    item_description: string;
    item_image_url: string | null;
    item_color: string;
  }) => {
    if (character) {
      setCharacter({
        ...character,
        item_title: updatedData.item_title,
        item_description: updatedData.item_description,
        item_image_url: updatedData.item_image_url || '',
        item_color: updatedData.item_color
      });
    }
  };

  // Função para atualizar dados do personagem após edição do conteúdo principal
  const handleMainContentEditSave = (updatedData: Record<string, string>) => {
    setCharacterData(updatedData);
  };

  // Função para atualizar dados do personagem após edição das informações da sidebar
  const handleSidebarInfoEditSave = (updatedData: {
    item_title: string;
    item_color: string;
    item_order: number;
    is_active: boolean;
  }) => {
    if (character) {
      setCharacter({
        ...character,
        item_title: updatedData.item_title,
        item_color: updatedData.item_color,
        item_order: updatedData.item_order,
        is_active: true
      });
    }
  };

  // Função para atualizar dados do personagem após edição da sidebar customizada
  const handleSidebarCustomEditSave = (updatedData: Record<string, string>) => {
    setCharacterData(updatedData);
    // Também atualiza o character se necessário
    if (character) {
      setCharacter({
        ...character,
        item_title: updatedData.nome || character.item_title,
        item_color: updatedData.corCard || character.item_color,
        item_order: parseInt(updatedData.ordem) || character.item_order,
        is_active: updatedData.status === 'Ativo'
      });
    }
  };

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
      {/* Header com estilo do Header.tsx global */}
      <FandomHeader
        fandomName={fandom.name}
        fandomDescription={fandom.description}
        fandomId={fandomId}
        creatorId={fandom.creator_id}
      />

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
                { label: "Alias:", value: characterData.alias || "Não informado" },
                { label: "Idade:", value: characterData.idade || "Não informado" },
                { label: "Data de Nascimento:", value: characterData.dataNascimento || "Não informado" },
                { label: "Gênero:", value: characterData.genero || "Não informado" },
                { label: "Afiliação:", value: characterData.afiliacao || "Não informado" },
                { label: "Espécie:", value: characterData.especie || "Não informado" },
              ])}

              {infoBlock("Aparência", [
                { label: "Tom de Pele:", value: characterData.tomPele || "Não informado" },
                { label: "Cor dos Olhos:", value: characterData.corOlhos || "Não informado" },
                { label: "Cor dos Cabelos:", value: characterData.corCabelos || "Não informado" },
                { label: "Altura:", value: characterData.altura || "Não informado" },
                { label: "Peso:", value: characterData.peso || "Não informado" },
              ])}

              {infoBlock("RPG/Game", [
                { label: "Classe:", value: characterData.classe || "Não informado" },
                { label: "Nível:", value: characterData.nivel || "Não informado" },
                { label: "Alinhamento:", value: characterData.alinhamento || "Não informado" },
                { label: "Status de Vida:", value: characterData.statusVida || "Vivo" },
              ])}
            </div>

            {/* Botões de Edição da Sidebar */}
            {user?.id === fandom.creator_id && (
              <div className="p-[15px] border-t border-gray-200">
                <div className="flex gap-2 justify-center">
                  {/* Botão para editar informações básicas (nome, descrição, imagem) */}
                  <button
                    onClick={() => setShowSidebarEditModal(true)}
                    className="bg-[#926DF6] text-white p-2 rounded-full hover:bg-[#A98AF8] transition-colors shadow-lg hover:shadow-xl"
                    title="Editar Informações Básicas"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {/* Botão para editar sidebar completa com campos customizáveis */}
                  <button
                    onClick={() => setShowSidebarCustomEditModal(true)}
                    className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
                    title="Editar Sidebar Completa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex w-full sm:w-1/2 lg:w-4/5 p-[20px] justify-center">
          <div className="flex flex-col rounded-[10px] bg-white w-full p-[20px] gap-[40px] shadow-lg relative">
            
            {/* Botão de Edição do Conteúdo Principal */}
            {user?.id === fandom.creator_id && (
              <div className="absolute top-4 right-4 z-10">
                {/* Botão para editar conteúdo principal (descrição detalhada) */}
                <button
                  onClick={() => setShowMainContentEditModal(true)}
                  className="bg-[#926DF6] text-white p-3 rounded-full hover:bg-[#A98AF8] transition-colors shadow-lg hover:shadow-xl"
                  title="Editar Conteúdo Principal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Nome do Personagem */}
            <div className="flex flex-col gap-[20px]">
              <h1 className="text-[40px] font-bold text-gray-800">{character.item_title}</h1>
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

            {/* Quote (Citação) */}
            <div className="flex flex-col w-full md:w-[60%] p-[20px] bg-gray-50 border-l-[5px] border-[#3E526E] gap-[10px] italic text-gray-700">
              <p>&ldquo;{characterData.quote || 'Aqui você pode adicionar uma citação marcante do personagem.'}&rdquo;</p>
              <div className="flex justify-end">
                <p>— {characterData.quoteSource || character.item_title}</p>
              </div>
            </div>

            {/* Descrição */}
            <div className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full">
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Descrição</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.descricaoDetalhada ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.descricaoDetalhada }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Esta seção exibe a descrição detalhada do personagem. Use o botão de edição (lápis) para adicionar uma descrição completa e detalhada.</div>
                )}
              </div>
            </div>

            {/* Seção: Personalidade */}
            <div
              id="personalidade"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Personalidade</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.personalidade ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.personalidade }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui a personalidade do personagem, seus traços de caráter, comportamentos típicos, valores e crenças.</div>
                )}
              </div>
            </div>

            {/* Seção: Aparência */}
            <div
              id="aparencia"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Aparência</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.aparencia ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.aparencia }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui as características físicas do personagem: altura, peso, cor dos olhos, cabelo, características distintivas, etc.</div>
                )}
              </div>
            </div>

            {/* Seção: Habilidades e Poderes */}
            <div
              id="habilidades"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Habilidades e Poderes</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.habilidades ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.habilidades }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Liste aqui as habilidades especiais, poderes, talentos e capacidades únicas do personagem.</div>
                )}
              </div>
            </div>

            {/* Seção: Equipamentos */}
            <div
              id="equipamentos"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Equipamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.equipamentos ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.equipamentos }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui as armas, armaduras, itens especiais e equipamentos que o personagem utiliza.</div>
                )}
              </div>
            </div>

            {/* Seção: Background */}
            <div
              id="background"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Background</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.background ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.background }} />
                ) : (
                  <p className="text-gray-500 italic">Conte aqui a história de fundo do personagem: sua origem, passado, eventos importantes que moldaram quem ele é hoje.</p>
                )}
              </div>
            </div>

            {/* Seção: Relacionamentos */}
            <div
              id="relacionamentos"
              className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full"
            >
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: character.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Relacionamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.relacionamentos ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.relacionamentos }} />
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
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {characterData.curiosidades ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: characterData.curiosidades }} />
                ) : (
                  <p className="text-gray-500 italic">Adicione aqui fatos interessantes, detalhes curiosos, manias, preferências e outras informações divertidas sobre o personagem.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modais de edição */}
      <SidebarEditModal
        isOpen={showSidebarEditModal}
        onClose={() => setShowSidebarEditModal(false)}
        character={character}
        onSave={handleSidebarEditSave}
      />
      <MainContentEditModal
        isOpen={showMainContentEditModal}
        onClose={() => setShowMainContentEditModal(false)}
        character={character}
        characterData={characterData}
        onSave={handleMainContentEditSave}
      />
      <SidebarInfoEditModal
        isOpen={showSidebarInfoEditModal}
        onClose={() => setShowSidebarInfoEditModal(false)}
        character={character}
        onSave={handleSidebarInfoEditSave}
      />
      <SidebarCustomEditModal
        isOpen={showSidebarCustomEditModal}
        onClose={() => setShowSidebarCustomEditModal(false)}
        character={character}
        characterData={characterData}
        onSave={handleSidebarCustomEditSave}
      />
    </div>
  );
}