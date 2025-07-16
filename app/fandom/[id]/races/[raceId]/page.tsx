'use client';

import { useEffect, useState } from "react";
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

// Função para renderizar blocos de informação
function infoBlock(title: string, items: { label: string; value: string }[]) {
  return (
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
}

// Modal para editar informações da sidebar
function SidebarEditModal({ 
  isOpen, 
  onClose, 
  race, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  race: Race | null; 
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
    if (race && isOpen) {
      setFormData({
        title: race.item_title,
        description: race.item_description,
        image_url: race.item_image_url || '',
        color: race.item_color
      });
    }
  }, [race, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!race) return;

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
        .eq('id', race.id);

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
              Nome da Raça *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Digite o nome da raça"
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
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor da Raça
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#926DF6] text-white rounded-md hover:bg-[#A98AF8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para editar informações da sidebar (customizável)
function SidebarCustomEditModal({ 
  isOpen, 
  onClose, 
  race, 
  raceData,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  race: Race | null; 
  raceData: Record<string, string>;
  onSave: (data: Record<string, string>) => void; 
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (race && isOpen) {
      setFormData({
        nome: race.item_title,
        tipo: raceData.tipo || '',
        origem: raceData.origem || '',
        habitat: raceData.habitat || '',
        expectativaVida: raceData.expectativaVida || '',
        tamanhoMedio: raceData.tamanhoMedio || '',
        idioma: raceData.idioma || '',
        corCard: race.item_color,
        ordem: race.item_order.toString(),
        status: race.is_active ? 'Ativo' : 'Inativo'
      });
    }
  }, [race, raceData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!race) return;

    setLoading(true);
    setMessage('');

    try {
      // Atualiza os dados customizados
      const { error: customError } = await supabase
        .from('section_items')
        .update({
          custom_data: {
            tipo: formData.tipo,
            origem: formData.origem,
            habitat: formData.habitat,
            expectativaVida: formData.expectativaVida,
            tamanhoMedio: formData.tamanhoMedio,
            idioma: formData.idioma
          }
        })
        .eq('id', race.id);

      if (customError) throw customError;

      // Atualiza informações básicas se mudaram
      if (formData.nome !== race.item_title || formData.corCard !== race.item_color || 
          parseInt(formData.ordem) !== race.item_order || 
          (formData.status === 'Ativo') !== race.is_active) {
        
        const { error: basicError } = await supabase
          .from('section_items')
          .update({
            item_title: formData.nome,
            item_color: formData.corCard,
            item_order: parseInt(formData.ordem),
            is_active: formData.status === 'Ativo'
          })
          .eq('id', race.id);

        if (basicError) throw basicError;
      }

      setMessage('Informações atualizadas com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave(formData);

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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Editar Sidebar Completa</h2>
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
              Nome da Raça *
            </label>
            <input
              type="text"
              value={formData.nome || ''}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Digite o nome da raça"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <input
              type="text"
              value={formData.tipo || ''}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: Humanoide, Besta, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origem
            </label>
            <input
              type="text"
              value={formData.origem || ''}
              onChange={(e) => handleInputChange('origem', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: Terra, Marte, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habitat
            </label>
            <input
              type="text"
              value={formData.habitat || ''}
              onChange={(e) => handleInputChange('habitat', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: Floresta, Deserto, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expectativa de Vida
            </label>
            <input
              type="text"
              value={formData.expectativaVida || ''}
              onChange={(e) => handleInputChange('expectativaVida', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: 80 anos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho Médio
            </label>
            <input
              type="text"
              value={formData.tamanhoMedio || ''}
              onChange={(e) => handleInputChange('tamanhoMedio', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: 1.70m"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <input
              type="text"
              value={formData.idioma || ''}
              onChange={(e) => handleInputChange('idioma', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Ex: Português, Élfico, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor da Raça
            </label>
            <input
              type="color"
              value={formData.corCard || '#926DF6'}
              onChange={(e) => handleInputChange('corCard', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={formData.ordem || '0'}
              onChange={(e) => handleInputChange('ordem', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'Ativo'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#926DF6] text-white rounded-md hover:bg-[#A98AF8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Editor TipTap
function EditorTiptap({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="border-b border-gray-300 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} className="p-3 min-h-[200px] prose prose-sm max-w-none" />
    </div>
  );
}

// Modal para editar conteúdo principal
function MainContentEditModal({ 
  isOpen, 
  onClose, 
  race, 
  raceData,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  race: Race | null; 
  raceData: Record<string, string>;
  onSave: (data: Record<string, string>) => void; 
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializa o formulário quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        descricaoDetalhada: raceData.descricaoDetalhada || '',
        personalidade: raceData.personalidade || '',
        aparencia: raceData.aparencia || '',
        habilidades: raceData.habilidades || '',
        equipamentos: raceData.equipamentos || '',
        background: raceData.background || '',
        relacionamentos: raceData.relacionamentos || '',
        curiosidades: raceData.curiosidades || '',
        quote: raceData.quote || '',
        quoteSource: raceData.quoteSource || ''
      });
    }
  }, [raceData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!race) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('section_items')
        .update({
          custom_data: {
            ...raceData,
            ...formData
          }
        })
        .eq('id', race.id);

      if (error) {
        throw error;
      }

      setMessage('Conteúdo atualizado com sucesso!');
      
      // Chama a função de callback para atualizar os dados
      onSave(formData);

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
              Descrição Detalhada (Ficha Principal)
            </label>
            <EditorTiptap
              value={formData.descricaoDetalhada || ''}
              onChange={(v) => handleInputChange('descricaoDetalhada', v)}
            />
            <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Esta descrição aparece na seção principal da ficha, separada da descrição curta da sidebar.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personalidade
              </label>
              <EditorTiptap
                value={formData.personalidade || ''}
                onChange={(v) => handleInputChange('personalidade', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aparência
              </label>
              <EditorTiptap
                value={formData.aparencia || ''}
                onChange={(v) => handleInputChange('aparencia', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habilidades e Poderes
              </label>
              <EditorTiptap
                value={formData.habilidades || ''}
                onChange={(v) => handleInputChange('habilidades', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipamentos
              </label>
              <EditorTiptap
                value={formData.equipamentos || ''}
                onChange={(v) => handleInputChange('equipamentos', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <EditorTiptap
                value={formData.background || ''}
                onChange={(v) => handleInputChange('background', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relacionamentos
              </label>
              <EditorTiptap
                value={formData.relacionamentos || ''}
                onChange={(v) => handleInputChange('relacionamentos', v)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curiosidades
              </label>
              <EditorTiptap
                value={formData.curiosidades || ''}
                onChange={(v) => handleInputChange('curiosidades', v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citação Marcante
              </label>
              <textarea
                value={formData.quote || ''}
                onChange={(e) => handleInputChange('quote', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent resize-none"
                placeholder="Uma citação marcante da raça..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte da Citação
              </label>
              <input
                type="text"
                value={formData.quoteSource || ''}
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

export default function RacePage() {
  const params = useParams();
  const fandomId = params.id as string;
  const raceId = params.raceId as string;

  const [race, setRace] = useState<Race | null>(null);
  const [fandom, setFandom] = useState<Fandom | null>(null);
  const [fandomPage, setFandomPage] = useState<FandomPage | null>(null);
  const [raceData, setRaceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Estados para controlar os modais de edição
  const [showSidebarEditModal, setShowSidebarEditModal] = useState(false);
  const [showMainContentEditModal, setShowMainContentEditModal] = useState(false);
  const [showSidebarCustomEditModal, setShowSidebarCustomEditModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega dados da fandom
        const { data: fandomData, error: fandomError } = await supabase
          .from('fandoms')
          .select('*')
          .eq('id', fandomId)
          .single();
        if (fandomError) throw new Error('Fandom não encontrada');
        setFandom(fandomData);

        // Carrega dados da página da fandom
        const { data: fandomPageData } = await supabase
          .from('fandom_pages')
          .select('*')
          .eq('fandom_id', fandomId)
          .single();
        setFandomPage(fandomPageData);

        // Carrega dados da raça
        const { data: raceData, error: raceError } = await supabase
          .from('section_items')
          .select('*')
          .eq('id', raceId)
          .single();
        if (raceError) throw new Error('Raça não encontrada');
        setRace(raceData);
        setRaceData(raceData.custom_data || {});

        // Carrega dados do usuário
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fandomId, raceId]);

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

  // Função para atualizar dados da raça após edição da sidebar
  const handleSidebarEditSave = (updatedData: {
    item_title: string;
    item_description: string;
    item_image_url: string | null;
    item_color: string;
  }) => {
    if (race) {
      setRace({
        ...race,
        item_title: updatedData.item_title,
        item_description: updatedData.item_description,
        item_image_url: updatedData.item_image_url || '',
        item_color: updatedData.item_color
      });
    }
  };

  // Função para atualizar dados da raça após edição do conteúdo principal
  const handleMainContentEditSave = (updatedData: Record<string, string>) => {
    setRaceData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  // Função para atualizar dados da raça após edição da sidebar customizada
  const handleSidebarCustomEditSave = (updatedData: Record<string, string>) => {
    setRaceData(prev => ({
      ...prev,
      tipo: updatedData.tipo,
      origem: updatedData.origem,
      habitat: updatedData.habitat,
      expectativaVida: updatedData.expectativaVida,
      tamanhoMedio: updatedData.tamanhoMedio,
      idioma: updatedData.idioma
    }));
    
    // Também atualiza o race se necessário
    if (race) {
      setRace({
        ...race,
        item_title: updatedData.nome || race.item_title,
        item_color: updatedData.corCard || race.item_color,
        item_order: parseInt(updatedData.ordem) || race.item_order,
        is_active: updatedData.status === 'Ativo'
      });
    }
  };

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
            style={{ borderColor: race.item_color }}
          >
            {/* Título */}
            <div 
              className="flex h-[40px] justify-center items-center rounded-t-[20px] border-b border-gray-300"
              style={{ backgroundColor: race.item_color }}
            >
              <p className="text-[25px] font-bold text-white">{race.item_title}</p>
            </div>
            {/* Imagem */}
            <div className="flex h-[250px] justify-center items-center overflow-hidden">
              {race.item_image_url ? (
                <Image
                  src={race.item_image_url}
                  alt={`Imagem de ${race.item_title}`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div 
                  className="flex items-center justify-center w-full h-full"
                  style={{ backgroundColor: race.item_color }}
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
                { label: "Nome:", value: race.item_title },
                { label: "Tipo:", value: raceData.tipo || "Não informado" },
                { label: "Origem:", value: raceData.origem || "Não informado" },
                { label: "Habitat:", value: raceData.habitat || "Não informado" },
                { label: "Expectativa de Vida:", value: raceData.expectativaVida || "Não informado" },
                { label: "Tamanho Médio:", value: raceData.tamanhoMedio || "Não informado" },
                { label: "Idioma:", value: raceData.idioma || "Não informado" },
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
            {/* Nome da Raça */}
            <div className="flex flex-col gap-[20px]">
              <h1 className="text-[40px] font-bold text-gray-800">{race.item_title}</h1>
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
              <p>&ldquo;{raceData.quote || 'Aqui você pode adicionar uma citação marcante da raça.'}&rdquo;</p>
              <div className="flex justify-end">
                <p>— {raceData.quoteSource || race.item_title}</p>
              </div>
            </div>
            {/* Descrição */}
            <div className="flex flex-col border-b-[1px] border-[#3E526E] pb-[40px] w-full">
              <div 
                className="h-[6px] w-[40px] mb-[5px]"
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Descrição</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.descricaoDetalhada ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.descricaoDetalhada }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Esta seção exibe a descrição detalhada da raça. Use o botão de edição (lápis) para adicionar uma descrição completa e detalhada.</div>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Personalidade</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.personalidade ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.personalidade }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui a personalidade típica da raça.</div>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Aparência</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.aparencia ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.aparencia }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui as características físicas típicas da raça.</div>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Habilidades e Poderes</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.habilidades ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.habilidades }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Liste aqui as habilidades especiais, poderes e talentos típicos da raça.</div>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Equipamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.equipamentos ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.equipamentos }} />
                ) : (
                  <div className="prose prose-sm prose-a:underline text-gray-500 italic w-full max-w-full break-words">Descreva aqui equipamentos, armas ou itens característicos da raça.</div>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Background</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.background ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.background }} />
                ) : (
                  <p className="text-gray-500 italic">Conte aqui a história de fundo da raça: origem, eventos importantes, etc.</p>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Relacionamentos</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.relacionamentos ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.relacionamentos }} />
                ) : (
                  <p className="text-gray-500 italic">Descreva aqui os relacionamentos típicos da raça: alianças, rivalidades, etc.</p>
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
                style={{ backgroundColor: race.item_color }}
              ></div>
              <h2 className="text-[25px] w-fit font-bold text-gray-800 mb-4">Curiosidades</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed max-w-full break-words">
                {raceData.curiosidades ? (
                  <div className="prose prose-sm prose-a:underline text-gray-700 leading-relaxed max-w-full break-words" dangerouslySetInnerHTML={{ __html: raceData.curiosidades }} />
                ) : (
                  <p className="text-gray-500 italic">Adicione aqui fatos interessantes, detalhes curiosos, manias, preferências e outras informações sobre a raça.</p>
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
        race={race}
        onSave={handleSidebarEditSave}
      />
      <MainContentEditModal
        isOpen={showMainContentEditModal}
        onClose={() => setShowMainContentEditModal(false)}
        race={race}
        raceData={raceData}
        onSave={handleMainContentEditSave}
      />
      <SidebarCustomEditModal
        isOpen={showSidebarCustomEditModal}
        onClose={() => setShowSidebarCustomEditModal(false)}
        race={race}
        raceData={raceData}
        onSave={handleSidebarCustomEditSave}
      />
    </div>
  );
} 