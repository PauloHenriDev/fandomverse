'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  bucketName?: string;
  folderName?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  bucketName = 'character-images',
  folderName = 'characters',
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('A imagem deve ter menos de 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Gera nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload da imagem para o storage do Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Gera URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Cria preview temporário
      setPreviewUrl(URL.createObjectURL(file));
      
      // Chama callback com a nova URL
      onImageUploaded(publicUrl);
      
    } catch (error: unknown) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview da imagem */}
      {displayImage && (
        <div className="relative">
          <img
            src={displayImage}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              title="Remover imagem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Input de upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {displayImage ? 'Alterar Imagem' : 'Adicionar Imagem'}
        </label>
        
        <div className="flex items-center space-x-4">
          <label className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#926DF6] cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? 'Fazendo upload...' : 'Selecionar arquivo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={disabled || uploading}
            />
          </label>
          
          {uploading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#926DF6] mr-2"></div>
              Upload em andamento...
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
        </p>
      </div>
    </div>
  );
} 