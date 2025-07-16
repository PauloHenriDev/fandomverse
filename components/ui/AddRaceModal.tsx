'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from './ImageUpload';

interface AddRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRaceAdded: () => void;
  fandomId: string;
  sectionId: string;
}

export default function AddRaceModal({ 
  isOpen, 
  onClose, 
  onRaceAdded, 
  fandomId, 
  sectionId 
}: AddRaceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#926DF6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O nome da raça é obrigatório');
      return;
    }

    if (!sectionId) {
      setError('Erro: Seção não encontrada. Recarregue a página e tente novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar o próximo item_order para a seção
      const { data: existingItems, error: orderError } = await supabase
        .from('section_items')
        .select('item_order')
        .eq('section_id', sectionId)
        .order('item_order', { ascending: false })
        .limit(1);

      if (orderError) {
        console.error('Erro ao buscar ordem dos itens:', orderError);
        throw new Error('Erro ao determinar ordem do item');
      }

      const nextOrder = (existingItems?.[0]?.item_order || 0) + 1;

      // Adicionar a raça no banco de dados
      const { data: newRace, error: insertError } = await supabase
        .from('section_items')
        .insert({
          section_id: sectionId,
          item_type: 'race',
          item_title: title.trim(),
          item_description: description.trim(),
          item_image_url: imageUrl || null,
          item_color: color,
          item_order: nextOrder,
          is_active: true,
          custom_data: {
            categories: []
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir raça:', insertError);
        throw new Error('Erro ao salvar raça no banco de dados');
      }

      console.log('Raça adicionada com sucesso:', newRace);

      // Limpa o formulário
      setTitle('');
      setDescription('');
      setImageUrl('');
      setColor('#926DF6');

      // Fecha o modal e notifica o componente pai
      onClose();
      onRaceAdded();

    } catch (error) {
      console.error('Erro ao adicionar raça:', error);
      setError(error instanceof Error ? error.message : 'Erro ao adicionar raça. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Adicionar Nova Raça</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Raça */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Raça *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
              placeholder="Ex: Humano, Elfo, Anão..."
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
              placeholder="Descreva as características da raça..."
            />
          </div>

          {/* Cor */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Cor da Raça
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent"
                placeholder="#926DF6"
              />
            </div>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem da Raça
            </label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageUploaded={setImageUrl}
              bucketName="character-images"
              folderName={`fandoms/${fandomId}/races`}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-2 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar Raça'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 