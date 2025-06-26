-- =====================================================
-- SCRIPT SEGURO PARA ATUALIZAR TABELA PROFILES EXISTENTE
-- =====================================================
-- Este script adiciona apenas o que está faltando, sem conflitos

-- Adiciona a coluna profile_settings se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_settings'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_settings JSONB DEFAULT '{}';
        RAISE NOTICE 'Coluna profile_settings adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna profile_settings já existe';
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
        RAISE NOTICE 'Coluna created_at adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe';
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
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe';
    END IF;
END $$;

-- Habilita Row Level Security se não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado com sucesso';
    ELSE
        RAISE NOTICE 'RLS já está habilitado';
    END IF;
END $$;

-- Cria políticas apenas se elas não existirem
DO $$
BEGIN
    -- Política de leitura pública
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow public read access to profiles'
    ) THEN
        CREATE POLICY "Allow public read access to profiles" ON profiles
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de leitura pública criada';
    ELSE
        RAISE NOTICE 'Política de leitura pública já existe';
    END IF;
    
    -- Política de criação
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to create their own profiles'
    ) THEN
        CREATE POLICY "Allow users to create their own profiles" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Política de criação criada';
    ELSE
        RAISE NOTICE 'Política de criação já existe';
    END IF;
    
    -- Política de atualização
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to update their own profiles'
    ) THEN
        CREATE POLICY "Allow users to update their own profiles" ON profiles
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Política de atualização criada';
    ELSE
        RAISE NOTICE 'Política de atualização já existe';
    END IF;
    
    -- Política de exclusão
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Allow users to delete their own profiles'
    ) THEN
        CREATE POLICY "Allow users to delete their own profiles" ON profiles
            FOR DELETE USING (auth.uid() = id);
        RAISE NOTICE 'Política de exclusão criada';
    ELSE
        RAISE NOTICE 'Política de exclusão já existe';
    END IF;
END $$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Cria o trigger apenas se ele não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_profiles_updated_at_column();
        RAISE NOTICE 'Trigger updated_at criado';
    ELSE
        RAISE NOTICE 'Trigger updated_at já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostra o status final
SELECT 
    'Tabela profiles atualizada com sucesso!' as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles') as total_columns,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as total_policies;

-- Para ver detalhes completos, execute:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position; 