'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AddCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  onCharacterAdded: () => void;
}

export default function AddCharacterModal({ 
  isOpen, 
  onClose, 
  sectionId, 
  onCharacterAdded 
}: AddCharacterModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    color: '#926DF6'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Busca o próximo item_order para a seção
      const { data: existingItems } = await supabase
        .from('section_items')
        .select('item_order')
        .eq('section_id', sectionId)
        .order('item_order', { ascending: false })
        .limit(1);

      const nextOrder = existingItems && existingItems.length > 0 
        ? existingItems[0].item_order + 1 
        : 1;

      // Insere o novo personagem
      const { error } = await supabase
        .from('section_items')
        .insert({
          section_id: sectionId,
          item_type: 'character',
          item_title: formData.title,
          item_description: formData.description,
          item_image_url: formData.image_url || null,
          item_color: formData.color,
          item_order: nextOrder,
          is_active: true
        });

      if (error) {
        throw error;
      }

      setMessage('Personagem adicionado com sucesso!');
      setFormData({
        title: '',
        description: '',
        image_url: '',
        color: '#926DF6'
      });
      
      onCharacterAdded();
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage('Erro ao adicionar personagem: ' + errorMessage);
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
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Adicionar Personagem</h2>
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
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={3}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent resize-none text-sm sm:text-base"
              placeholder="Descreva o personagem..."
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#926DF6] focus:border-transparent text-sm sm:text-base"
              placeholder="https://exemplo.com/imagem.jpg"
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#926DF6] text-white py-2 sm:py-2 px-4 rounded-lg hover:bg-[#A98AF8] transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {loading ? 'Adicionando...' : 'Adicionar Personagem'}
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