-- =====================================================
-- SCRIPT DE CRIAÇÃO DA TABELA PROFILES
-- =====================================================
-- Este script cria a tabela profiles no Supabase com todas as
-- configurações necessárias para o sistema de perfis de usuário

-- Criação da tabela profiles com estrutura completa
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,  -- ID do usuário (referência ao auth.users)
    nickname VARCHAR(100),                                            -- Apelido do usuário
    avatar_url TEXT,                                                  -- URL da imagem de avatar
    profile_settings JSONB DEFAULT '{}',                             -- Configurações de personalização do perfil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),               -- Data de criação automática
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()                -- Data de última atualização
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índice para buscar perfis por nickname (para busca de usuários)
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);

-- Índice para ordenar por data de atualização
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- =====================================================
-- CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY)
-- =====================================================

-- Habilita Row Level Security na tabela
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Permite que qualquer usuário veja todos os perfis
-- Isso permite que a comunidade veja os perfis dos usuários
CREATE POLICY "Allow public read access to profiles" ON profiles
    FOR SELECT USING (true);

-- Política 2: Permite que usuários criem seus próprios perfis
-- Verifica se o usuário logado é o dono do perfil
CREATE POLICY "Allow users to create their own profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política 3: Permite que usuários atualizem apenas seus próprios perfis
-- Garante que apenas o dono pode editar seu perfil
CREATE POLICY "Allow users to update their own profiles" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política 4: Permite que usuários excluam apenas seus próprios perfis
-- Garante que apenas o dono pode excluir seu perfil
CREATE POLICY "Allow users to delete their own profiles" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- FUNÇÃO E TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função que atualiza automaticamente o campo updated_at
-- Esta função é chamada sempre que um registro é atualizado
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();  -- Define a data atual como updated_at
    RETURN NEW;              -- Retorna o registro atualizado
END;
$$ language 'plpgsql';

-- Trigger que executa a função update_profiles_updated_at_column
-- antes de qualquer UPDATE na tabela profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

-- Função que cria automaticamente um perfil quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nickname)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nickname');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função handle_new_user
-- após um INSERT na tabela auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMENTÁRIOS ADICIONAIS
-- =====================================================

-- A tabela profiles está agora configurada com:
-- ✅ Estrutura de dados completa
-- ✅ Índices para performance
-- ✅ Segurança baseada em usuário (RLS)
-- ✅ Timestamps automáticos
-- ✅ Integridade referencial com auth.users
-- ✅ Cascade delete (se usuário for excluído, seu perfil também é)
-- ✅ Criação automática de perfil ao registrar
-- ✅ Campo JSONB para configurações flexíveis

-- Estrutura do campo profile_settings (JSONB):
-- {
--   "headerColor": "#f97316",
--   "headerImage": "https://...",
--   "backgroundColor": "#ffffff",
--   "aboutBackgroundColor": "#ef4444",
--   "textColor": "#000000",
--   "about": "Descrição do usuário..."
-- }

-- Para testar a configuração, você pode executar:
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM pg_policies WHERE tablename = 'profiles'; 