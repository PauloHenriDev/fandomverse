-- =====================================================
-- SCRIPT PARA CRIAR BUCKET DE IMAGENS DE PERSONAGENS
-- =====================================================
-- Execute este script no SQL Editor do Supabase para criar
-- o bucket de armazenamento para imagens de personagens

-- Cria o bucket para imagens de personagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'character-images',
  'character-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA PARA O BUCKET
-- =====================================================

-- Política para permitir upload de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated users to upload character images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'character-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir visualização pública das imagens
CREATE POLICY "Allow public read access to character images" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');

-- Política para permitir atualização de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated users to update character images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'character-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated users to delete character images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'character-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
/*
Este script:
1. Cria um bucket chamado 'character-images' para armazenar imagens de personagens
2. Define o bucket como público (acessível sem autenticação)
3. Limita o tamanho dos arquivos a 5MB
4. Permite apenas tipos de imagem (JPEG, PNG, GIF, WebP)
5. Configura políticas de segurança para:
   - Upload: apenas usuários autenticados
   - Visualização: público
   - Atualização: apenas usuários autenticados
   - Exclusão: apenas usuários autenticados

Para executar:
1. Vá para o SQL Editor no Supabase Dashboard
2. Cole este script
3. Clique em "Run" para executar
*/ 