-- =====================================================
-- SCRIPT PARA ATUALIZAR TABELA PROFILES EXISTENTE
-- =====================================================
-- Este script adiciona as colunas e configurações necessárias
-- à tabela profiles que já existe no seu Supabase

-- Adiciona a coluna profile_settings se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_settings'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- Adiciona a coluna created_at se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Adiciona a coluna updated_at se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Habilita Row Level Security se não estiver habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to create their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profiles" ON profiles;

-- Cria as políticas de segurança
CREATE POLICY "Allow public read access to profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to create their own profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profiles" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to delete their own profiles" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remove trigger existente se houver
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Cria o trigger para updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Para verificar se tudo foi atualizado corretamente, execute:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- Para verificar as políticas RLS:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

-- A tabela profiles agora deve ter:
-- ✅ id (UUID) - já existia
-- ✅ nickname (VARCHAR) - já existia  
-- ✅ avatar_url (TEXT) - já existia
-- ✅ profile_settings (JSONB) - NOVA COLUNA
-- ✅ created_at (TIMESTAMP) - NOVA COLUNA
-- ✅ updated_at (TIMESTAMP) - NOVA COLUNA
-- ✅ RLS habilitado
-- ✅ Políticas de segurança configuradas
-- ✅ Trigger para updated_at automático 