'use client';

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Cropper, { Area } from 'react-easy-crop';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  bucketName?: string;
  folderName?: string;
  className?: string;
  disabled?: boolean;
}

// Define a type for crop area
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Função utilitária para crop em canvas
function getCroppedImg(imageSrc: string, crop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = image.naturalWidth / image.width;
      const cropX = crop.x * scale;
      const cropY = crop.y * scale;
      const cropWidth = crop.width * scale;
      const cropHeight = crop.height * scale;
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject();
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject();
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
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
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter menos de 5MB.');
      return;
    }
    setRawImage(URL.createObjectURL(file));
    setShowCrop(true);
  };

  const handleCropSave = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels);
      const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(2)}.jpeg`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, croppedBlob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      onImageUploaded(publicUrl);
      setShowCrop(false);
      setRawImage(null);
    } catch {
      alert('Erro ao fazer upload da imagem recortada.');
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
      {/* Modal de Crop */}
      {showCrop && rawImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col items-center">
            <div className="relative w-72 h-72 bg-gray-100">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex gap-4 mt-4 w-full items-center">
              <label className="flex-1 text-xs">Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <button
                className="bg-[#926DF6] text-white px-4 py-2 rounded hover:bg-[#A98AF8] transition-colors"
                onClick={handleCropSave}
                disabled={uploading}
              >
                {uploading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                onClick={() => { setShowCrop(false); setRawImage(null); }}
                disabled={uploading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Preview da imagem */}
      {displayImage && (
        <div className="relative">
          <Image src={displayImage} alt="Preview" width={300} height={200} className="w-full h-auto rounded" unoptimized />
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