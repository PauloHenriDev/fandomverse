-- =====================================================
-- SCRIPT SIMPLIFICADO PARA CRIAR A TABELA PROFILES
-- =====================================================

-- Criação da tabela profiles com estrutura básica
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nickname VARCHAR(100),
    avatar_url TEXT,
    profile_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de segurança
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

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

-- 1. Execute este script no SQL Editor do Supabase
-- 2. A tabela profiles será criada com todas as funcionalidades necessárias
-- 3. O campo profile_settings armazena as configurações de personalização
-- 4. As políticas RLS garantem que usuários só podem editar seus próprios perfis

-- Para verificar se foi criado corretamente:
-- SELECT * FROM profiles LIMIT 1; 