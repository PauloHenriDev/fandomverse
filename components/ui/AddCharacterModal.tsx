'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';

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
          <h2 className="text-xl font-bold text-gray-800">Adicionar Personagem</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Personagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Personagem *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#926DF6]"
              placeholder="Descreva o personagem..."
            />
          </div>

          {/* Upload de Imagem */}
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageUploaded={handleImageUploaded}
            bucketName="character-images"
            folderName="characters"
          />

          {/* Cor do Personagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do Personagem
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          {/* Mensagem */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('sucesso') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#926DF6] text-white rounded-md hover:bg-[#A98AF8] transition-colors disabled:opacity-50"
            >
              {loading ? 'Adicionando...' : 'Adicionar Personagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 